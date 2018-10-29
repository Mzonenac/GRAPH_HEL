  const Jimp = require('jimp'),
        path = require('path');

  let watermark = async function (buffer, position) {
     //if you are following along, create the following 2 images relative to this script:
     let imgRaw = path.resolve(sails.config.appPath + '//'+ buffer);
     let imgLogoR = path.resolve(sails.config.appPath + '//'+ './ghost-8.png');

     const imgActive = 'clonedImage.png',
           imgExported = 'mergedImage.png',
           wmCor = 17,
           y = 100;
     let x = position - wmCor;

    return  await Jimp.read(imgRaw)
                   .then(tpl => tpl.clone())
                   .then(tpl => new Promise((res, rej) => tpl.write(('./' + imgActive), (err,ret)=> err ? rej(err) : res(ret))))
                   .then(() => (Jimp.read(imgActive)))
                   //combine images
                   .then(tpl => (
                     Jimp.read(imgLogoR).then(logoTpl => {
                       return tpl.composite(logoTpl, x, y, [Jimp.BLEND_OVERLAY, 1, 1]);
                     })
                   ))
                   .then(tpl => new Promise((res, rej) => tpl.write(('./' + imgExported), (err,ret)=> err ? rej(err) : res(ret))))
                   .then(() => { return { error: null, url: imgExported } })
                   .catch(err => {
                     console.error('Failed combine images the original image', err);
                     return { error: err, url: imgRaw }
                   });
  }
  module.exports = watermark;
