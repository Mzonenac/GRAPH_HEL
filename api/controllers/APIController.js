module.exports = {
  getData: function(req, res) {
      const
      body = require('../js/data-json'),
      handler = require('../js/handler');
      let event = {
            body: body
      },
      Res = res,
      flag = true; // ghost image adding if it's true
      handler.handler(event, null, Res, flag, (res) => {
          if (res.error) {
              throw 'Failed! alertId- ' + res.alertId + ' reason: ' + JSON.stringify(res.error);
          }
          console.log('Success: ' + JSON.stringify(res));
      });
  }

}
