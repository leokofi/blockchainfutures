'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (callback) {
    send({
      path: 'commands'
    }, callback);
  });
};