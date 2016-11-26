'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    send({
      path: 'version',
      qs: opts
    }, function (err, result) {
      if (err) {
        return callback(err);
      }
      var version = {
        version: result.Version,
        commit: result.Commit,
        repo: result.Repo
      };
      callback(null, version);
    });
  });
};