'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    add: promisify(function (hash, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = null;
      }
      send({
        path: 'pin/add',
        args: hash,
        qs: opts
      }, function (err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res.Pins);
      });
    }),
    rm: promisify(function (hash, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = null;
      }
      send({
        path: 'pin/rm',
        args: hash,
        qs: opts
      }, function (err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res.Pins);
      });
    }),
    ls: promisify(function (hash, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }

      if ((typeof hash === 'undefined' ? 'undefined' : _typeof(hash)) === 'object') {
        opts = hash;
        hash = undefined;
      }

      if (typeof hash === 'function') {
        callback = hash;
        hash = undefined;
        opts = {};
      }

      send({
        path: 'pin/ls',
        args: hash,
        qs: opts
      }, function (err, res) {
        if (err) {
          return callback(err);
        }
        callback(null, res.Keys);
      });
    })
  };
};