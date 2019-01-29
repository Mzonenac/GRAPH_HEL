    const fs = require('fs'),
          createHash = require('hash-generator'),
          hashLength = 20,
          AWS = require('aws-sdk');


    const s3 = new AWS.S3();
    const publishService = function (url, res, publishMode) {
      if(!fs.existsSync(url)) { res.json({error : "File not Found"}); return }
      let filestream = fs.createReadStream(url);
      let filename = generateFileName();
      if (publishMode) {
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
      s3.upload(params, (err, data) => {
         if (err) console.log(err);
         let url = data.Location;
      });
    }

    module.exports = publishService;
