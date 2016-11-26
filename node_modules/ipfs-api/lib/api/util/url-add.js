'use strict';

var Wreck = require('wreck');
var addToDagNodesTransform = require('./../../add-to-dagnode-transform');

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (url, opts, callback) {
    if (typeof opts === 'function' && callback === undefined) {
      callback = opts;
      opts = {};
    }

    // opts is the real callback --
    // 'callback' is being injected by promisify
    if (typeof opts === 'function' && typeof callback === 'function') {
      callback = opts;
      opts = {};
    }

    if (typeof url !== 'string' || !url.startsWith('http')) {
      return callback(new Error('"url" param must be an http(s) url'));
    }

    var sendWithTransform = send.withTransform(addToDagNodesTransform);

    Wreck.request('GET', url, null, function (err, res) {
      if (err) {
        return callback(err);
      }

      sendWithTransform({
        path: 'add',
        qs: opts,
        files: res
      }, callback);
    });
  });
};