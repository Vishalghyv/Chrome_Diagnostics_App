// Extension ID  
const editorExtensionId = "bmmafoiimnhodnheabiffdmpjjgnfnnh";

// Connecting, Fetching data from chrome extension and Adding it to PWA

// Connection with Chrome Extension.
let port = chrome.runtime.connect(editorExtensionId, {name: "systemInformation"})

// Using port message for bi-directional connection.
port.postMessage({detail: "cpu"})


port.onMessage.addListener( function (msg) {
        // Updating CPU information
        if (msg.cpu) {
            displayCPUInfo(msg.cpu)
            port.postMessage({ detail: "storage"});
        }

        // Updaing Storage information
        if (msg.storage) {
            displayStorageInfo(msg.storage)
            port.postMessage({ detail: "usage", timer: 2000});
        }
        // Updating Memory and CPU usage in charts.
        if (msg.usage) {
            cpuUtilization(msg.usage.cpuUsage)
            memoryUtilization(msg.usage.memUsage)
        }
    }
)

// Display CPU information
function displayCPUInfo( cpu) {
    cpuName.textContent = cpu.modelName;
    cpuChart.data.datasets = createDataSet(cpu.processors);
    cpuChart.update({
    preservation: true,
    });
    let txt = "";
    txt += `
    <p> Architecture name: ${cpu.archName} </p>
    <p> Model name: ${cpu.modelName} </p>
    <p> Number of processors: ${cpu.numOfProcessors} </p>
    `;
    cpuInfo.innerHTML = txt;
}

// Display Storage Information
function displayStorageInfo(storage) {
    let txt = "";
    storage.forEach((storageDisk) => {
        let marker = 1024 ** 3
        let capacity = (storageDisk.capacity / marker).toFixed(2);
        if (capacity != 0) {
        txt += `
        <p> Storage Drive: ${storageDisk.name} (${storageDisk.type}) </p>
        <p> Capacity: ${capacity} GB </p>
        `;
        }
    storageInfo.innerHTML = txt;
    });
}

// Updates CPU utilization chart
function cpuUtilization(cpuUsage) {
    cpuUsage.forEach((usage) => {
        cpuChart.data.datasets[usage.id].data.push({
            x: Date.now(),
            y: usage.usage,
        });
    });
    cpuChart.update({
        preservation: true,
    });
}

// Updates memory usage title and chart
function memoryUtilization(memory) {
            
    memUsage.textContent = `${memory.used} GiB of ${memory.total} GiB`;
    
    percentageMemory = Math.round((memory.used / memory.total) * 100)

    memChart.data.datasets[0].data[0] = 100 - percentageMemory
    memChart.data.datasets[0].data[1] = percentageMemory

    memChart.update({
        preservation: false,
    });
}