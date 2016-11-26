'use strict';

var promisify = require('promisify-es6');
var cleanMultihash = require('../clean-multihash');

module.exports = function (send) {
  return promisify(function (hash, callback) {
    try {
      hash = cleanMultihash(hash);
    } catch (err) {
      return callback(err);
    }

    send({
      path: 'cat',
      args: hash
    }, callback);
  });
};