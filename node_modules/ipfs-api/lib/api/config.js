'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var streamifier = require('streamifier');
var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    get: promisify(function (key, callback) {
      if (typeof key === 'function') {
        callback = key;
        key = undefined;
      }

      if (!key) {
        send({
          path: 'config/show',
          buffer: true
        }, callback);
        return;
      }

      send({
        path: 'config',
        args: key,
        buffer: true
      }, function (err, response) {
        if (err) {
          return callback(err);
        }
        callback(null, response.Value);
      });
    }),
    set: promisify(function (key, value, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      if (typeof key !== 'string') {
        return callback(new Error('Invalid key type'));
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) !== 'object' && typeof value !== 'boolean' && typeof value !== 'string') {
        return callback(new Error('Invalid value type'));
      }

      if ((typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
        value = JSON.stringify(value);
        opts = { json: true };
      }

      if (typeof value === 'boolean') {
        value = value.toString();
        opts = { bool: true };
      }

      send({
        path: 'config',
        args: [key, value],
        qs: opts,
        files: undefined,
        buffer: true
      }, callback);
    }),
    replace: promisify(function (config, callback) {
      if ((typeof config === 'undefined' ? 'undefined' : _typeof(config)) === 'object') {
        config = streamifier.createReadStream(new Buffer(JSON.stringify(config)));
      }

      send({
        path: 'config/replace',
        files: config,
        buffer: true
      }, callback);
    })
  };
};