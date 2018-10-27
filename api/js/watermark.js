  const
  path = require('path'),
  Jimp = require('jimp');


   let watermark = function (url) {
      //if you are following along, create the following 2 images relative to this script:
      let imgRaw = path.resolve(sails.config.appPath + '//./'+ url);
      let imgLogo = path.resolve(sails.config.appPath + '//'+ './ghost-5.png');
      //---

      let imgActive = 'image.png';
      let imgExported = 'wm-' + url;


      //read template & clone raw image
     return  Jimp.read(imgRaw)
        .then(tpl => (tpl.clone().write(imgActive)))

        //read cloned (active) image
        .then(() => (Jimp.read(imgActive)))

        //combine logo into image
        .then(tpl => (
          Jimp.read(imgLogo)
          .then(logoTpl => {
            logoTpl
            .resize(Jimp.AUTO, 150)
            .opacity(0.8);
            return tpl.composite(logoTpl, 200, 20, [Jimp.BLEND_OVERLAY, 1, 1]);
          })
        ))

        //export image
        .then(tpl => (tpl.rgba(true).write('./' + imgExported)))

        //log exported filename
        .then(tpl => {
          let fi = path.resolve(sails.config.appPath+'//'+ imgExported);
//          execute(fi, res);
          console.log('exported file: ' + imgExported);
          return imgExported
        })

        //catch errors
        .catch(err => {
          console.error(err);
        });
    }

 module.exports = watermark;
