'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    wantlist: promisify(function (callback) {
      send({
        path: 'bitswap/wantlist'
      }, callback);
    }),
    stat: promisify(function (callback) {
      send({
        path: 'bitswap/stat'
      }, callback);
    }),
    unwant: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'bitswap/unwant',
        args: args,
        qs: opts
      }, callback);
    })
  };
};