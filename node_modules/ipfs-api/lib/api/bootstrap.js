'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    add: promisify(function (args, opts, callback) {
      if (typeof opts === 'function' && !callback) {
        callback = opts;
        opts = {};
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts;
        opts = {};
      }

      if (args && (typeof args === 'undefined' ? 'undefined' : _typeof(args)) === 'object') {
        opts = args;
        args = undefined;
      }

      send({
        path: 'bootstrap/add',
        args: args,
        qs: opts
      }, callback);
    }),
    rm: promisify(function (args, opts, callback) {
      if (typeof opts === 'function' && !callback) {
        callback = opts;
        opts = {};
      }

      // opts is the real callback --
      // 'callback' is being injected by promisify
      if (typeof opts === 'function' && typeof callback === 'function') {
        callback = opts;
        opts = {};
      }

      if (args && (typeof args === 'undefined' ? 'undefined' : _typeof(args)) === 'object') {
        opts = args;
        args = undefined;
      }

      send({
        path: 'bootstrap/rm',
        args: args,
        qs: opts
      }, callback);
    }),
    list: promisify(function (opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'bootstrap/list',
        qs: opts
      }, callback);
    })
  };
};