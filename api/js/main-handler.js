const graphService = require('./graph-service');

exports.handler = (event, context, Res, callback) => {

  const content = event.body,
  chartColors = ['rgb(255, 205, 86)','rgb(54, 162, 235)','rgb(255, 0, 0)','rgba(255, 205, 87, 0.5)','rgba(54, 162, 236,0.5)'];

	function getTypeOfGraph(datasets) {
	  if(!datasets) datasets = [];
      const emptyValue = datasets.filter( e => !e)
      return ( (datasets.length - emptyValue.length) <= datasets.length * 0.25) ? 'bar': 'line';
  }

		let series = [],
		  alertId = Object.keys(content)[0],
		  responseBody = {}
			timespan = [],
			justOnce = true,
			payload = content[alertId],
			in_series = payload.series,
			thresholdSize = 0,
			publishMode = true;  //true if it is testing mode not used the AWS

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

      function createPromise(xAxis, data, position, Id, Res, publishMode) {
        return new Promise(function (resolve, reject) {
          graphService(xAxis, data, position, Res, publishMode, (res, err) => {
            if (!err) {
              resolve({
                url: res,
                alertId: Id,
              });
            } else {
              reject({
               alertId: Id,
               error: JSON.stringify(err)
               });
            }
          });
        });
      }
      //create promisse array of graph

      createPromise(timespan, series, annotationPosition, alertId, Res, publishMode)
      .then(result => {
        responseBody[result.alertId]=result.url;
        responseBody.url = result.url;
        responseBody.error = result.error
        callback(result);
      })
      .catch (reason => {
        callback({
            alertId: alertId,
            error: reason
        });
      });
}
