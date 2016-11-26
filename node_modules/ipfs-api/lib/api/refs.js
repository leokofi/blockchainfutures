'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  var refs = promisify(function (args, opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    return send({
      path: 'refs',
      args: args,
      qs: opts
    }, callback);
  });
  refs.local = promisify(function (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }
    return send({
      path: 'refs',
      qs: opts
    }, callback);
  });

  return refs;
};