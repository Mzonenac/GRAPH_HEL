const
    createHash = require('hash-generator'),
    ChartjsNode = require('chartjs-node'),
    hashLength = 20,
    watermark = require('../js/watermark');

const myChartOptions = {
    legend: {
        labels: {
            fontColor: "rgba(0, 0, 0, 1)",
            fontSize: 12
        }
    },
    elements:{ point: { radius: 0 } },
    responsive: true,
    title:{
        display:false
    },
    tooltips: {
        mode: 'index',
        intersect: false,
        bodyFontSize: 0,
        titleMarginBottom:1,
        xPadding: 8,
        yPadding:10
    },
    hover: {
        mode: 'nearest',
        intersect: true
    },
    scales: {
        xAxes: [{
            type:'time',
            time: {
                unit: 'minute',
                displayFormats: {
                    minute: 'h:mm a'
                }
            },
            ticks: {
                source: 'labels',
                fontColor: 'rgba(0, 0, 0, 1)',
                fontSize: 12
            },
            display: true,
            scaleLabel: {
                display: true,
                labelString: 'Time (UTC)',
                fontColor: 'rgba(0, 0, 0, 1)',
                fontSize: 12
            }
        }],
        yAxes: [{
            display: true,
            scaleLabel: {
                display: true,
                labelString: 'Value',
                fontColor: 'rgba(0, 0, 0, 1)',
                fontSize: 12
            },
            ticks: {
                source: 'labels',
                fontColor: 'rgba(0, 0, 0, 1)',
                fontSize: 12
            }
        }]
    }
}
const type = 'image/png';
let createGraph = function(timespan, series, annotationPosition, callback) {
    // console.log('And if we are here, it means that the graph service was called')
    let chartJsOptions = {
          data:{
              labels : timespan,
              datasets: series,
          },
          type: series[0].type,
          options: myChartOptions,
          plugins:{

              //draws the background
              beforeDraw: function (chart, easing) {
                  let self = chart.config;    /* Configuration object containing type, data, options */
                  let ctx = chart.chart.ctx;  /* Canvas context used to draw with */
                  ctx.fillStyle = "#fff";
                  ctx.fillRect(0, 0, chart.chart.width, chart.chart.height);
              },

              afterDraw: function (chart, easing) {
                  if (chart.tooltip._active == undefined) {
                      chart.tooltip._active = [];
                  }
                  let activeElements = chart.tooltip._active;
                  let requestedElem = chart.getDatasetMeta(annotationPosition.dataset).data[annotationPosition.peakPoint];
                  for(let i = 0; i < activeElements.length; i++) {
                      if(requestedElem._index == activeElements[i]._index)
                         return;
                  }
                  activeElements.push(requestedElem);
                  chart.tooltip._active = activeElements;
                  chart.tooltip.update(true);
                  chart.draw();
              }
          }
      }
    let chartNode = new ChartjsNode(400, 250);
    return chartNode.drawChart(chartJsOptions)
        .then(() => {
            console.log('chart created')

            // get image as png buffer
            return chartNode.getImageBuffer(type);
        })
        .then(buffer => {
            Array.isArray(buffer)
            return chartNode.getImageStream(type);
        })
        .then(streamResult => {
            var params = {Bucket: 'loom-images', Key: generateFileName(), Body: streamResult.stream, ContentType:type};
            console.info(streamResult.stream)
//            return s3.upload(params, function(err, data) {
//                if (err !== null){
//                    console.log(err);
//                }
//                let url = data.Location;
//                callback(url);
//            });

            // write to a file
            let url = generateFileName();
            chartNode.writeImageToFile(type, './' + url)
            .then( () => {
                watermark(url)
                .then( (res) => callback(res))
            })
        })
        .catch(function(e){
          console.info(e)
        })
}

    function generateFileName() {
      const hash = createHash(hashLength);
      return 'graph_image_' + hash + '.png';
    }

module.exports = createGraph;

