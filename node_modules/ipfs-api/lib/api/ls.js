'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (args, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    send({
      path: 'ls',
      args: args,
      qs: opts
    }, callback);
  });
};