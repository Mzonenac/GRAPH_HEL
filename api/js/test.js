const
      body = require('../api/data-json'),
      handler = require('../api/handler');
      let event = {
            body: body
      },
      ghost = false; // ghost image adding if it's true
      handler.handler(event, null, ghost, (res) => {
          if (res.error) {
              throw 'Failed! alertId- ' + res.alertId + ' reason: ' + JSON.stringify(res.error);
          }
          console.log('Success: ' + JSON.stringify(res));
      });
