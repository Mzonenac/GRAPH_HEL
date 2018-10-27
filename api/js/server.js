const bodyParser = require("body-parser"),
	graphService = require('./microservice'),
    chartColors = ['rgb(255, 205, 86)','rgb(54, 162, 235)','rgb(255, 0, 0)','rgba(255, 205, 87, 0.5)','rgba(54, 162, 236,0.5)'];

	function getTypeOfGraph(datasets) {
	  if(!datasets) return 'bar';
      var eValue = datasets.filter( function(el){
        return el
      });
      return (eValue.length <= datasets.length * 0.75) ? 'bar': 'line';
    }

exports.handler = (event, context, callback) => {
	process.env['PATH'] = process.env['PATH'] + ':' + process.env['LAMBDA_TASK_ROOT'] + '/lib';
	process.env['LD_LIBRARY_PATH'] = process.env['LAMBDA_TASK_ROOT'] + '/lib';
	process.env['PKG_CONFIG_PATH'] = process.env['LAMBDA_TASK_ROOT'] + '/lib';
	var content = event.body,
		promises = [],
		responseBody = {};

	try {
		content = JSON.parse(content);
		console.log('The parsing worked..');
	} catch(e){
		content = event.body;
		console.log(e);
		console.log('The parsing not worked...');
	}

	for (var alertId in content) {
		var series = [],
			timespan = [],
			justOnce = 1,
			payload = content[alertId],
			in_series = payload.series,
			thresholdSize = 0,
			typeOfGraph;

	    for (var key in in_series){
	        if (in_series.hasOwnProperty(key)){
	            var values = [];
	            for (var innerkey in in_series[key]){
	                if (in_series[key].hasOwnProperty(innerkey)) {
	                    if (justOnce == 1){
	                        timespan.push(innerkey);
						}
						values.push(in_series[key][innerkey]);
	                }
	            }

	            thresholdSize = values.length;
	            typeOfGraph = 'line'; //getTypeOfGraph(values);

	            var seriesName = key,
	            	color = chartColors[0],
	            	backgroundColor = chartColors[3];

	            if (key == 'lastHourSeries'){
	            	seriesName = 'Events/Minute';
	            	color = chartColors[1];
	            	backgroundColor = chartColors[4]
	            }
	            else if (key == 'prevDaySeries'){
	            	seriesName = 'Baseline';
	            	color = chartColors[0];
	            	backgroundColor = chartColors[3]
	            }

	            series.push({
	                    label: seriesName,
	                    fill: true,
	                   	backgroundColor: backgroundColor,
	                   	borderColor: color,
	                    data: values
	                });
	            justOnce = 0;
	        }
	    }

	    if (payload.hasOwnProperty('threshold') && payload.threshold) {
	        var color = chartColors[2];
	        var thresholdArray = [];
	        thresholdArray.length = thresholdSize;
	        thresholdArray.fill(payload.threshold);
	        series.push(
	            {
	                label: 'threshold',
	                fill: false,
	               	backgroundColor: color,
	               	borderColor: color,
	               	borderWidth: 1,
	                data: thresholdArray
	            }
	        )
	    }

	    var annotationPosition = {};
	    var annotationIndex = timespan.findIndex(function(element){ return element == payload.detectionTime});
	    annotationPosition['peakPoint'] = annotationIndex === -1 ? 0: annotationIndex;
	    annotationPosition['dataset'] = series.findIndex(function(element){ return element.label == 'Events/Minute'})

   		//timespan is in seconds
	    timespan = timespan.map(x => parseInt(x) * 1000);

		function createPromisse(xAxis, data, position, Id, typeOfGraph) {
			return new Promise(function (resolve, reject) {
				graphService(xAxis, data, position, typeOfGraph, function (innerRes, innerErr) {
					if (innerRes !== null) {
						resolve({
							url: innerRes,
							alertId: Id
						});
					} else {
						reject('Could not generate graph');
					}
				});
			});
		}
		//create promisse array of graph
		var promise = createPromisse(timespan, series, annotationPosition, alertId, typeOfGraph)
		promises.push(promise);
	}

	Promise
	.all(promises)
	.then(resp => {
		resp.forEach(result => responseBody[result.alertId]=result.url)
		var response = {
	        "statusCode": 200,
	        "headers": {
	            "Content-Type": "application/json"
	        },
	        "body": JSON.stringify(responseBody),
	        "isBase64Encoded": false
	    };
		callback (null, response);

    let filename = req.param("filename");
    let filepath = req.param("filepath");

    let file = require('path').resolve(sails.config.appPath+'//'+filepath)

    if(fs.existsSync(file))
    {
          res.setHeader('Content-disposition', 'attachment; filename=' + filename);

          let filestream = fs.createReadStream(file);
          filestream.pipe(res);

    }else{
        res.json({error : "File not Found"});
    }
	})
	.catch(reason => {
//		callback (reason)
	});
};
