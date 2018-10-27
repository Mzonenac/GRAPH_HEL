const chartColors = ['rgb(255, 205, 86)','rgb(54, 162, 235)','rgb(255, 0, 0)','rgba(255, 205, 87, 0.5)','rgba(54, 162, 236,0.5)'];
const graphService = require('./microservice');


exports.handler = (event, context, callback) => {

  const content = event.body;

	function getTypeOfGraph(datasets) {
	  if(!datasets) datasets = [];
      let eValue = datasets.filter( function(el){
        return el
      });
      return (eValue.length <= datasets.length * 0.25) ? 'bar': 'line';
    }



  let	promises = [],
  		responseBody = {};

	for (let alertId in content) {
		let series = [],
			timespan = [],
			justOnce = true,
			payload = content[alertId],
			in_series = payload.series,
			thresholdSize = 0;

	    for (let key in in_series){
	        if (in_series.hasOwnProperty(key)){
	            var values = [];
	            for (var innerkey in in_series[key]){
	                if (in_series[key].hasOwnProperty(innerkey)) {
	                    if (justOnce){
	                        timespan.push(innerkey);
						}
						values.push(in_series[key][innerkey]);
	                }
	            }

	            thresholdSize = values.length;

	            let seriesName = key,
	            	color = chartColors[0],
	            	backgroundColor = chartColors[3];

	            if (key == 'lastHourSeries'){
	            	seriesName = 'Events/Minute';
	            	color = chartColors[1];
	            	backgroundColor = chartColors[4]
	            }
	             else if (key == 'prevDaySeries') {
	            	seriesName = 'Baseline';
	            	color = chartColors[0];
	            	backgroundColor = chartColors[3];
	            }

	            series.push({
	                    label: seriesName,
	                    fill: true,
	                   	backgroundColor: backgroundColor,
	                   	borderColor: color,
	                    data: values,
	                    type: getTypeOfGraph(values)
	                });
	            justOnce = false;
	        }
	    }

	    if (payload.hasOwnProperty('threshold') && payload.threshold) {
	        let color = chartColors[2];
	        let thresholdArray = [];
	        thresholdArray.length = thresholdSize;
	        thresholdArray.fill(payload.threshold);
	        series.push(
	            {
	                label: 'Threshold',
	                fill: false,
	               	backgroundColor: color,
	               	borderColor: color,
	               	borderWidth: 1,
	                data: thresholdArray,
	                type: 'line'
	            }
	        )
	    }

	    let annotationPosition = {};
	    let annotationIndex = timespan.findIndex(function(element){ return element == payload.detectionTime});
	    annotationPosition['peakPoint'] = annotationIndex === -1 ? 0: annotationIndex;
	    annotationPosition['dataset'] = series.findIndex(function(element){ return element.label == 'Events/Minute'})

   		//timespan is in seconds
	    timespan = timespan.map(x => parseInt(x) * 1000);

		function createPromise(xAxis, data, position, Id) {
			return new Promise(function (resolve, reject) {
				graphService(xAxis, data, position, (res, err) => {
					if (res !== null) {
						resolve({
							url: res,
							alertId: Id
						});
					} else {
						reject('Could not generate graph');
					}
				});
			});
		}
		//create promisse array of graph
		let promise = createPromise(timespan, series, annotationPosition, alertId)
		promises.push(promise);
	}

	Promise
	.all(promises)
	.then(resp => {
		resp.forEach(result => { responseBody[result.alertId]=result.url; responseBody.url = result.url; })
		callback (null, responseBody);
	})
	.catch (reason => {
	  console.info(reason)
		callback (reason)
	});
}
