module.exports = {
  getData: function(req, res) {
      const body = require('../js/data-json'),
            handler = require('../js/main-handler');
      const event = {
            body: body
      };
      const Res = res;
      handler.handler(event, null, Res, response => {
          if (response.error) {
              throw 'Failed! alertId- ' + response.alertId + ' reason: ' + JSON.stringify(response.error);
            }
          else {
              console.log('Success: ' + JSON.stringify(response));
          }
          return res.redirect('/graph' );

      })



  }

}
