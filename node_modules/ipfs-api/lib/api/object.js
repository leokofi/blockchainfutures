'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var DAGNode = require('ipfs-merkle-dag').DAGNode;
var DAGLink = require('ipfs-merkle-dag').DAGLink;
var promisify = require('promisify-es6');
var bs58 = require('bs58');
var bl = require('bl');
var cleanMultihash = require('../clean-multihash');

module.exports = function (send) {
  var api = {
    get: promisify(function (multihash, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }

      try {
        multihash = cleanMultihash(multihash, options);
      } catch (err) {
        return callback(err);
      }

      send({
        path: 'object/get',
        args: multihash
      }, function (err, result) {
        if (err) {
          return callback(err);
        }

        var node = new DAGNode(result.Data, result.Links.map(function (l) {
          return new DAGLink(l.Name, l.Size, new Buffer(bs58.decode(l.Hash)));
        }));

        callback(null, node);
      });
    }),
    put: promisify(function (obj, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }

      var tmpObj = {
        Data: null,
        Links: []
      };

      if (Buffer.isBuffer(obj)) {
        if (!options.enc) {
          tmpObj = { Data: obj.toString(), Links: [] };
        }
      } else if (obj.multihash) {
        tmpObj = {
          Data: obj.data.toString(),
          Links: obj.links.map(function (l) {
            return l.toJSON();
          })
        };
      } else if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
        tmpObj.Data = obj.Data.toString();
      } else {
        return callback(new Error('obj not recognized'));
      }

      var buf = void 0;
      if (Buffer.isBuffer(obj) && options.enc) {
        buf = obj;
      } else {
        buf = new Buffer(JSON.stringify(tmpObj));
      }
      var enc = options.enc || 'json';

      send({
        path: 'object/put',
        qs: { inputenc: enc },
        files: buf
      }, function (err, result) {
        if (err) {
          return callback(err);
        }

        if (Buffer.isBuffer(obj)) {
          if (!options.enc) {
            obj = { Data: obj, Links: [] };
          } else if (options.enc === 'json') {
            obj = JSON.parse(obj.toString());
          }
        }
        var node = void 0;
        if (obj.multihash) {
          node = obj;
        } else if (options.enc === 'protobuf') {
          node = new DAGNode();
          node.unMarshal(obj);
        } else {
          node = new DAGNode(obj.Data, obj.Links);
        }

        if (node.toJSON().Hash !== result.Hash) {
          return callback(new Error('Stored object was different from constructed object'));
        }

        callback(null, node);
      });
    }),
    data: promisify(function (multihash, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }

      try {
        multihash = cleanMultihash(multihash, options);
      } catch (err) {
        return callback(err);
      }

      send({
        path: 'object/data',
        args: multihash
      }, function (err, result) {
        if (err) {
          return callback(err);
        }

        if (typeof result.pipe === 'function') {
          result.pipe(bl(callback));
        } else {
          callback(null, result);
        }
      });
    }),
    links: promisify(function (multihash, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      if (!options) {
        options = {};
      }

      try {
        multihash = cleanMultihash(multihash, options);
      } catch (err) {
        return callback(err);
      }

      send({
        path: 'object/links',
        args: multihash
      }, function (err, result) {
        if (err) {
          return callback(err);
        }

        var links = [];

        if (result.Links) {
          links = result.Links.map(function (l) {
            return new DAGLink(l.Name, l.Size, new Buffer(bs58.decode(l.Hash)));
          });
        }
        callback(null, links);
      });
    }),
    stat: promisify(function (multihash, opts, callback) {
      if (typeof opts === 'function') {
        callback = opts;
        opts = {};
      }
      if (!opts) {
        opts = {};
      }

      try {
        multihash = cleanMultihash(multihash, opts);
      } catch (err) {
        return callback(err);
      }

      send({
        path: 'object/stat',
        args: multihash
      }, callback);
    }),
    new: promisify(function (callback) {
      send({
        path: 'object/new'
      }, function (err, result) {
        if (err) {
          return callback(err);
        }
        var node = new DAGNode();

        if (node.toJSON().Hash !== result.Hash) {
          return callback(new Error('Stored object was different from constructed object'));
        }

        callback(null, node);
      });
    }),
    patch: {
      addLink: promisify(function (multihash, dLink, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        if (!opts) {
          opts = {};
        }

        try {
          multihash = cleanMultihash(multihash, opts);
        } catch (err) {
          return callback(err);
        }

        send({
          path: 'object/patch/add-link',
          args: [multihash, dLink.name, bs58.encode(dLink.hash).toString()]
        }, function (err, result) {
          if (err) {
            return callback(err);
          }
          api.get(result.Hash, { enc: 'base58' }, callback);
        });
      }),
      rmLink: promisify(function (multihash, dLink, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        if (!opts) {
          opts = {};
        }

        try {
          multihash = cleanMultihash(multihash, opts);
        } catch (err) {
          return callback(err);
        }

        send({
          path: 'object/patch/rm-link',
          args: [multihash, dLink.name]
        }, function (err, result) {
          if (err) {
            return callback(err);
          }
          api.get(result.Hash, { enc: 'base58' }, callback);
        });
      }),
      setData: promisify(function (multihash, data, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        if (!opts) {
          opts = {};
        }

        try {
          multihash = cleanMultihash(multihash, opts);
        } catch (err) {
          return callback(err);
        }

        send({
          path: 'object/patch/set-data',
          args: [multihash],
          files: data
        }, function (err, result) {
          if (err) {
            return callback(err);
          }
          api.get(result.Hash, { enc: 'base58' }, callback);
        });
      }),
      appendData: promisify(function (multihash, data, opts, callback) {
        if (typeof opts === 'function') {
          callback = opts;
          opts = {};
        }
        if (!opts) {
          opts = {};
        }

        try {
          multihash = cleanMultihash(multihash, opts);
        } catch (err) {
          return callback(err);
        }

        send({
          path: 'object/patch/append-data',
          args: [multihash],
          files: data
        }, function (err, result) {
          if (err) {
            return callback(err);
          }
          api.get(result.Hash, { enc: 'base58' }, callback);
        });
      })
    }
  };

  return api;
};