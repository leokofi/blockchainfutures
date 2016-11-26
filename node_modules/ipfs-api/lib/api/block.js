'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var promisify = require('promisify-es6');
var bl = require('bl');
var Block = require('ipfs-block');

module.exports = function (send) {
  return {
    get: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      return send({
        path: 'block/get',
        args: args,
        qs: opts
      }, function (err, res) {
        if (err) {
          return callback(err);
        }
        if (Buffer.isBuffer(res)) {
          callback(null, new Block(res));
        } else {
          res.pipe(bl(function (err, data) {
            if (err) {
              return callback(err);
            }
            callback(null, new Block(data));
          }));
        }
      });
    }),
    stat: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      return send({
        path: 'block/stat',
        args: args,
        qs: opts
      }, function (err, stats) {
        if (err) {
          return callback(err);
        }
        callback(null, {
          key: stats.Key,
          size: stats.Size
        });
      });
    }),
    put: promisify(function (block, callback) {
      if (Array.isArray(block)) {
        var err = new Error('block.put() only accepts 1 file');
        return callback(err);
      }

      if ((typeof block === 'undefined' ? 'undefined' : _typeof(block)) === 'object' && block.data) {
        block = block.data;
      }

      return send({
        path: 'block/put',
        files: block
      }, function (err, blockInfo) {
        if (err) {
          return callback(err);
        }
        callback(null, new Block(block));
      });
    })
  };
};