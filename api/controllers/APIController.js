module.exports = {
  getData: function(req, res) {
      const
      body = require('../js/data-json'),
      handler = require('../js/handler'),
      execute = require('../js/execute'),
      event = {
          body: body
      },
      Res = res;

      handler.handler(event, null, (err, res) => {
          if (err) {
              throw 'Failed: ' + JSON.stringify(err);
          }
          console.log('Success: ' + JSON.stringify(res));
          execute(res.url, Res);
      });

  }

}
