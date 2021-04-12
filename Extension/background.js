// Connection with PWA

chrome.runtime.onConnectExternal.addListener ( function(port) {
  if (port.name == "systemInformation") {
      port.onMessage.addListener(function (message) {
        switch(message.detail) {
          // Return CPU information
          case "cpu":
              chrome.system.cpu.getInfo(function (info) {
                  port.postMessage({cpu: info})
                });
              break
          case "storage":
          // Return Storage information
              chrome.system.storage.getInfo(function (info) {
                  port.postMessage({storage: info})
                });
              break

          // Return CPU and Memory usage information
          case "usage":
              let usage = {}
              function sendUsage() { 
                  // send cpu and memory 
                  chrome.system.cpu.getInfo((info) => {
                      usage.cpuUsage = getCpuUtilization(info);
                    });
                  chrome.system.memory.getInfo((info) => {
                      usage.memUsage = getMemoryUtilization(info)
                    });
                  if (Object.keys(usage).length) {
                      port.postMessage({ usage: usage });
                    }
                }
              let interval = setInterval(sendUsage, message.timer);
              
              // Clear interval on disconnect
              port.onDisconnect.addListener(function () {
                  clearInterval(interval);
                  port = null;
                });
              break
        }
      })
  }
})

let previousInfo = 0;

// Return CPU utilization processor wise
function getCpuUtilization(cpuInfo) {
  
  let usage = [];
  let percentageUsed = 0;

  cpuInfo.processors.forEach((processor, index) => {
      let finalTime = processor.usage.kernel + processor.usage.user;
      let intialTime = 0
      let totalTime = processor.usage.total
      if (previousInfo) {
          let previousProcessor = previousInfo.processors[index].usage;
          intialTime = previousProcessor.kernel  + previousProcessor.user;
          totalTime = totalTime - previousProcessor.total
      }
      // Calculaing Processor Utilization
      percentageUsed = Math.floor(
          ((finalTime -
            intialTime) /
            totalTime) *
            100
        );
      
      usage.push({ id: index, usage: percentageUsed });
  });
  previousInfo = cpuInfo;
  return usage
}


function getMemoryUtilization(memInfo) {
  // Convert bytes to GB
  let marker = 1.074e9;
  let leftMem = memInfo.availableCapacity / marker;
  let totalMem = memInfo.capacity / marker;
  return {
    used : (totalMem - leftMem).toFixed(2),
    total : totalMem.toFixed(2)
  };
}