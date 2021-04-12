// Creation of charts

  // Creating CPU Utilization chart
  let cpuConfig = lineConfig("CPU Utilization")
  let cpuChartCanvas = document.getElementById("cpuChart").getContext("2d")
  let cpuChart = new Chart(cpuChartCanvas, cpuConfig)

  // Creating Memory Usage Pie Chart
  let memConfig = pieConfig("Memory Usage")
  let memChartCanvas = document.getElementById("memChart").getContext("2d")
  var memChart = new Chart(memChartCanvas,memConfig);

// Configuration and Dataset of Charts

  function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  }

  // Create data set for plotting Processor utilization
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


  // Line Chart configuration
  function lineConfig(title) {
      return {
        type: "line",
        data: {
          datasets: [],
        },
        options: {
          title: {
            display: true,
            text: title,
          },
          responsive: false,
          tooltips: {
            mode: "nearest",
            intersect: false,
          },
          scales: {
            xAxes: [
              {
                type: "realtime",
                realtime: {
                  duration: 30000,
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
                  stepSize: 15
              },
              },
            ],
          },
        },
      };
    }

    // Pie Chart configuration
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
  
  const editorExtensionId = "bmmafoiimnhodnheabiffdmpjjgnfnnh";

// Connecting, Fetching data from chrome extension and Adding it to PWA

  // Connection with Chrome Extension.
  let port = chrome.runtime.connect(editorExtensionId)

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