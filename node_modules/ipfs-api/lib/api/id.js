'use strict';

var promisify = require('promisify-es6');

module.exports = function (send) {
  return promisify(function (opts, callback) {
    if (typeof opts === 'function') {
      callback = opts;
      opts = undefined;
    }
    send({
      path: 'id',
      args: opts
    }, function (err, result) {
      if (err) {
        return callback(err);
      }
      var identity = {
        id: result.ID,
        publicKey: result.PublicKey,
        addresses: result.Addresses,
        agentVersion: result.AgentVersion,
        protocolVersion: result.ProtocolVersion
      };
      callback(null, identity);
    });
  });
};