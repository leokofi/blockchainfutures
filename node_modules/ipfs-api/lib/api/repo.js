'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    gc: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'repo/gc',
        qs: opts
      }, callback);
    }),
    stat: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'repo/stat',
        qs: opts
      }, callback);
    })
  };
};