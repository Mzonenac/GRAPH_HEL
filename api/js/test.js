const createHash = require('hash-generator'),
hashLength = 20;

var generateFileName = function () {
  const hash = createHash(hashLength);
  return 'graph_image_' + hash + '.png';
}

module.exports = generateFileName;
