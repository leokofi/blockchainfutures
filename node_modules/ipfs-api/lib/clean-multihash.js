'use strict';

var bs58 = require('bs58');
var isIPFS = require('is-ipfs');

module.exports = function (multihash) {
  if (!isIPFS.multihash(multihash)) {
    throw new Error('not valid multihash');
  }
  if (Buffer.isBuffer(multihash)) {
    return bs58.encode(multihash);
  }
  return multihash;
};