let previousInfo = 0;

chrome.runtime.onConnect.addListener ( function(port) {
  if (port.name == "systemInformation") {
      port.onMessage.addListener(function (message) {
          // Return CPU information
          if (message.detail == "cpu") {
              chrome.system.cpu.getInfo(function (info) {
                  port.postMessage({cpu: info})
                });
          }
          // Return Storage information
          if (message.detail == "storage") {
              chrome.system.storage.getInfo(function (info) {
                  port.postMessage({storage: info})
                });
          }
          // Return Display information
          if (message.detail == "display") {
              chrome.system.display.getInfo(function (info) {
                  port.postMessage({display: info})
                });
          }
          // Return CPU and Memory usage information
          if (message.detail == "usage" && message.timer) {
              let usage = {}
              function sendUsage() { 
                  // send cpu and memory 
                  chrome.system.cpu.getInfo((info) => {
                      usage.cpuUsage = getCpuUtilization(info);
                    });
                  chrome.system.memory.getInfo((info) => {
                      // Convert bytes to GB
                      let marker = 1.074e9;
                      let leftMem = info.availableCapacity / marker;
                      let totalMem = info.capacity / marker;
                      usage.memUsage = {
                        used : (totalMem - leftMem).toFixed(2),
                        total : totalMem.toFixed(2)
                      };
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
          }
      })
  }
})


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
