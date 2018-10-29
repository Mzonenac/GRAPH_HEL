module.exports = {
  getData: function(req, res) {
      const
      body = require('../js/data-json'),
      handler = require('../js/handler');
      let event = {
            body: body
      },
      Res = res;
      handler.handler(event, null, Res, (res) => {
          if (res.error) {
              throw 'Failed! alertId- ' + res.alertId + ' reason: ' + JSON.stringify(res.error);
          }
          console.log('Success: ' + JSON.stringify(res));
      });
  }

}
