'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    apply: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'update',
        qs: opts
      }, callback);
    }),
    check: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'update/check',
        qs: opts
      }, callback);
    }),
    log: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'update/log',
        qs: opts
      }, callback);
    })
  };
};