'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return {
    publish: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'name/publish',
        args: args,
        qs: opts
      }, callback);
    }),
    resolve: promisify(function (args, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      send({
        path: 'name/resolve',
        args: args,
        qs: opts
      }, callback);
    })
  };
};