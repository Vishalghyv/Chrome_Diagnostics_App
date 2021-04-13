// Creation of charts

  // Creating CPU Utilization chart
  let cpuConfig = lineConfig("CPU Utilization")
  let cpuChartCanvas = document.getElementById("cpuChart").getContext("2d")
  let cpuChart = new Chart(cpuChartCanvas, cpuConfig)

  // Creating Memory Usage Pie Chart
  let memConfig = pieConfig("Memory Usage")
  let memChartCanvas = document.getElementById("memChart").getContext("2d")
  var memChart = new Chart(memChartCanvas,memConfig);

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
          responsive: true,
          maintainAspectRatio: true,
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
          responsive: true,
          maintainAspectRatio: true,
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

    for (i=0; i<Object.keys(names).length ; i++) {
        let dataSet = {
            label: `Processor - ${i + 1}`,
            borderColor: getRandomColor(),
            fill: false,
            cubicInterpolationMode: "monotone",
            data: [],
            };
        datasests.push(dataSet);
    }
  return datasests;
}