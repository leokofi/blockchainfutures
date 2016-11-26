'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (ipfs, ipns, callback) {
    if (typeof ipfs === 'function') {
      callback = ipfs;
      ipfs = null;
    } else if (typeof ipns === 'function') {
      callback = ipns;
      ipns = null;
    }
    var opts = {};
    if (ipfs) {
      opts.f = ipfs;
    }
    if (ipns) {
      opts.n = ipns;
    }

    send({
      path: 'mount',
      qs: opts
    }, callback);
  });
};