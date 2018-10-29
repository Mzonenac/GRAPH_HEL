    const path = require('path'),
          fs = require('fs'),
          createHash = require('hash-generator'),
          hashLength = 20,
          AWS = require('aws-sdk');


    const s3 = new AWS.S3();
    let execute = function (f, res, type) {
      if(!fs.existsSync(f)) { res.json({error : "File not Found"}); return }
      let filestream = fs.createReadStream(f);
      let filename = generateFileName();
      if (type) {
        fileDownload(filestream, res, filename);
        return {url: filename, error: null}
      } else {
        return uploadAWS(filestream, filename);
      }

    }

    function fileDownload(filestream, res, filename) {
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      filestream.pipe(res);
    }

    function generateFileName() {
      const hash = createHash(hashLength);
      return 'graph_image_' + hash + '.png';
    }

    function uploadAWS (filestream, filename) {
      let params = {Bucket: 'loom-images', Key: filename, Body: filestream, ContentType:'image/png'};
      let s3 = new AWS.S3();
      return {url: filename, error: null}
      s3.upload(params, function(err, data) {
         if (err) {
           console.log(err);
         }
         let url = data.Location;

         });
    }

    module.exports = execute;
