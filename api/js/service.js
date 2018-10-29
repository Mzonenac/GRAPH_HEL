const
    ChartjsNode = require('chartjs-node'),
    watermark = require('../js/watermark'),
    execute = require('../js/execute'),
    type = 'image/png',
    image = 'image.png';


    let myChartOptions = {
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
            bodyFontSize: 8,
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
    let createGraph = async function(timespan, series, annotationPosition, Res, flag, callbackHandler) {
        let activeLength;
        let position;
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
        return await chartNode.drawChart(chartJsOptions)
            .then((chart) => {
              console.log('Chart is created successfully')
              // set x position of watermark image
              position = chart.chart.getDatasetMeta(annotationPosition.dataset).data[annotationPosition.peakPoint]._model.x;
               // get image as png buffer
              chartNode.writeImageToFile(type, image)
              .then(() => ( flag ? watermark(image, position) : {url: image, error: null} ))
              .then ((response) => {
                if (!response) return callbackHandler(null, 'error');
                let res = publish(response.url, Res);
                if (!res) return callbackHandler(null, 'error');
                return callbackHandler(res.url, res.error);
              })
            })
            .catch((e) => {
              return callbackHandler(null, e);
            })
    }
    function publish(url, Res) {
       return execute(url, Res, true); //true is testing mode not used the AWS
    }

    module.exports = createGraph;

