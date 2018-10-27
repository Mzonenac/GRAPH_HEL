    const path = require('path'),
          fs = require('fs'),
          AWS = require('aws-sdk')

    let s3 = new AWS.S3();
    let execute = function (f, res) {
      if(!fs.existsSync(f)) { res.json({error : "File not Found"}); return }
      res.setHeader('Content-disposition', 'attachment; filename=' + f);
      let filestream = fs.createReadStream(f);
      console.info(filestream)
      filestream.pipe(res);
    }

    module.exports = execute;
