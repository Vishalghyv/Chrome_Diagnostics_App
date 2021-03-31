// Creating CPU Utilization chart
let cpuConfig = lineConfig("CPU Utilization")
let cpuChartCanvas = document.getElementById("cpuChart").getContext("2d")
let cpuChart = new Chart(cpuChartCanvas, cpuConfig)

// Creating Memory Usage Pie Chart
let memConfig = pieConfig("Memory Usage")
let memChartCanvas = document.getElementById("memChart").getContext("2d")
var memChart = new Chart(memChartCanvas,memConfig);

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function createDataSet(names) {
    let datasests = [];

    names.forEach((name, i) => {
        let dataSet = {
            label: `Processor - ${i + 1}`,
            borderColor: getRandomColor(),
            fill: false,
            cubicInterpolationMode: "monotone",
            data: [],
            };
        datasests.push(dataSet);
    });
  return datasests;
}


// Default configuration
function lineConfig(title) {
    return {
      type: "line",
      data: {
        datasets: [],
      },
      options: {
        responsive: false,
        title: {
          display: true,
          text: title,
        },
        scales: {
          xAxes: [
            {
              type: "realtime",
              realtime: {
                duration: 40000,
                refresh: 1000,
                delay: 2000,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                min: 0,
                max: 100,
                stepSize: 20
             },
              scaleLabel: {
                display: true,
                labelString: "value",
              },
            },
          ],
        },
        tooltips: {
          mode: "nearest",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: false,
        },
      },
    };
  }

  function pieConfig(title) {
    return {
      type: "pie",
      data: {
        labels: [ "Left", "Used"],
        datasets: [{
          label: "Population (millions)",
          backgroundColor: [ "#c335f2", "#2ec8f2"],
          hoverBackgroundColor: ["#a42bcc", "#229cbd"],
          data: [50,50]
        }]
      },
      options: {
        responsive: false,
        title: {
          display: true,
          text: title,
        },
        rotation: Math.PI,
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              return data['labels'][tooltipItem['index']] + ': ' + data['datasets'][0]['data'][tooltipItem['index']] + '%';
            }
          }
        }
      },
    };
  }


// Connection with Chrome Extension.
let port = chrome.runtime.connect({name: "systemInformation"})

// Using port message for bi-directional connection.
port.postMessage({detail: "cpu"})

port.onMessage.addListener( function (msg) {
        // Updating CPU information
        if (msg.cpu) {
            cpuName.textContent = msg.cpu.modelName;
            cpuChart.data.datasets = createDataSet(msg.cpu.processors);
            cpuChart.update({
            preservation: true,
            });
            let txt = "";
            txt += `
              <p> Architecture name: ${msg.cpu.archName} </p>
              <p> Model name: ${msg.cpu.modelName} </p>
              <p> Number of processors: ${msg.cpu.numOfProcessors} </p>
            `;
            cpuInfo.innerHTML = txt;
            port.postMessage({ detail: "storage"});
        }

        // console.log(msg)
        // Updaing Storage information
        if (msg.storage) {
            let txt = "";
            msg.storage.forEach((storage) => {
                let marker = 1024 ** 3
                let capacity = (storage.capacity / marker).toFixed(2);
                if (capacity != 0) {
                  txt += `
                  <p> Storage Drive: ${storage.name} (${storage.type}) </p>
                  <p> Capacity: ${capacity} GB </p>
                  `;
                }
            storageInfo.innerHTML = txt;
            });
            port.postMessage({ detail: "display"});
        }

        if (msg.display) {
          let txt = "";
          msg.display.forEach((display) => {
              txt += `
              <p> Scren Resolution: ${display.bounds.height} x ${display.bounds.width} </p>
              <p> Screen Name: ${display.name}  </p>
              `;
              displayInfo.innerHTML = txt;
          });
          displayInfo.innerHTML = txt;
          port.postMessage({ detail: "usage", timer: 2000});
      }
        // Updating Memory and CPU usage in charts.
        if (msg.usage) {
            // update cpu usage
            msg.usage.cpuUsage.forEach((usage) => {
            cpuChart.data.datasets[usage.id].data.push({
                x: Date.now(),
                y: usage.usage,
            });
            });
            cpuChart.update({
            preservation: true,
            });

            // update memory usage title and chart
            let memory = msg.usage.memUsage;
            
            memUsage.textContent = `${memory.used} GiB of ${memory.total} GiB`;
            
            percentageMemory = Math.round((memory.used / memory.total) * 100)

            memChart.data.datasets[0].data[0] = 100 - percentageMemory
            memChart.data.datasets[0].data[1] = percentageMemory

            memChart.update({
              preservation: false,
              });

            
              
        }
    }

)