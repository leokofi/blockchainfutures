'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (id, callback) {
    send({
      path: 'ping',
      args: id,
      qs: { n: 1 }
    }, function (err, res) {
      if (err) {
        return callback(err, null);
      }
      callback(null, res[1]);
    });
  });
};