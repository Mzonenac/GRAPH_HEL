    const fs = require('fs'),
          createHash = require('hash-generator'),
          hashLength = 20,
          AWS = require('aws-sdk');
          AWS.config.update({
          
          });

    const publishService = function (url, res, publishMode, publishResult) {
      if(!fs.existsSync(url))
        return {error : "File not Found"};
      const filestream = fs.createReadStream(url);
      const filename = generateFileName();
      if (publishMode) {
        fileDownload(filestream, res, filename, publishResult);
      } else {
        uploadAWS(filestream, filename, (result) => publishResult(result))
      }
    }

    function fileDownload(filestream, res, filename, publishResult) {
      res.setHeader('Content-disposition', 'attachment; filename=' + filename);
      filestream.pipe(res)
      .on('finish', (e) => publishResult({url: filename, error: null} ) )
      .on('error', (e) => console.log('error', e))
    }

    function generateFileName() {
      const hash = createHash(hashLength);
      return 'graph_image_' + hash + '.png';
    }

    function uploadAWS (filestream, filename, callBack) {
      const params = {Bucket: 'loom-public-open-for-upload', Key: filename, Body: filestream  , ContentType:'image/png'};
      const s3 = new AWS.S3();
      let url
      s3.upload(params, (error, data) => {
       if (error)
        callBack({"error" : error})
       else
        callBack({url: data.Location, error: null})
      });
    }


    module.exports = publishService;
