'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    net: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      send({
        path: 'diag/net',
        qs: opts
      }, callback);
    }),
    sys: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      send({
        path: 'diag/sys',
        qs: opts
      }, callback);
    }),
    cmds: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      send({
        path: 'diag/cmds',
        qs: opts
      }, callback);
    })
  };
};