'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var Wreck = require('wreck');
var Qs = require('qs');
var ndjson = require('ndjson');
var getFilesStream = require('./get-files-stream');

var isNode = require('detect-node');

// -- Internal

function parseChunkedJson(res, cb) {
  var parsed = [];
  res.pipe(ndjson.parse()).on('data', function (obj) {
    parsed.push(obj);
  }).on('end', function () {
    cb(null, parsed);
  });
}

function onRes(buffer, cb, uri) {
  return function (err, res) {
    if (err) {
      return cb(err);
    }

    var stream = Boolean(res.headers['x-stream-output']);
    var chunkedObjects = Boolean(res.headers['x-chunked-output']);
    var isJson = res.headers['content-type'] && res.headers['content-type'].indexOf('application/json') === 0;

    if (res.statusCode >= 400 || !res.statusCode) {
      var _ret = function () {
        var error = new Error('Server responded with ' + res.statusCode);

        return {
          v: Wreck.read(res, { json: true }, function (err, payload) {
            if (err) {
              return cb(err);
            }
            if (payload) {
              error.code = payload.Code;
              error.message = payload.Message || payload.toString();
            }
            cb(error);
          })
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }

    if (stream && !buffer) {
      return cb(null, res);
    }

    if (chunkedObjects) {
      if (isJson) {
        return parseChunkedJson(res, cb);
      }

      return Wreck.read(res, null, cb);
    }

    Wreck.read(res, { json: isJson }, cb);
  };
}

function requestAPI(config, options, callback) {
  options.qs = options.qs || {};

  if (Array.isArray(options.files)) {
    options.qs.recursive = true;
  }

  if (Array.isArray(options.path)) {
    options.path = options.path.join('/');
  }
  if (options.args && !Array.isArray(options.args)) {
    options.args = [options.args];
  }
  if (options.args) {
    options.qs.arg = options.args;
  }
  if (options.files && !Array.isArray(options.files)) {
    options.files = [options.files];
  }

  if (options.qs.r) {
    options.qs.recursive = options.qs.r;
    // From IPFS 0.4.0, it throws an error when both r and recursive are passed
    delete options.qs.r;
  }

  options.qs['stream-channels'] = true;

  var stream = void 0;
  if (options.files) {
    stream = getFilesStream(options.files, options.qs);
  }

  // this option is only used internally, not passed to daemon
  delete options.qs.followSymlinks;

  var port = config.port ? ':' + config.port : '';

  var opts = {
    method: 'POST',
    uri: config.protocol + '://' + config.host + port + config['api-path'] + options.path + '?' + Qs.stringify(options.qs, { arrayFormat: 'repeat' }),
    headers: {}
  };

  if (isNode) {
    // Browsers do not allow you to modify the user agent
    opts.headers['User-Agent'] = config['user-agent'];
  }

  if (options.files) {
    if (!stream.boundary) {
      return callback(new Error('No boundary in multipart stream'));
    }

    opts.headers['Content-Type'] = 'multipart/form-data; boundary=' + stream.boundary;
    opts.payload = stream;
  }

  return Wreck.request(opts.method, opts.uri, opts, onRes(options.buffer, callback, opts.uri));
}

//
// -- Module Interface

exports = module.exports = function getRequestAPI(config) {
  /*
   * options: {
   *   path:   // API path (like /add or /config) - type: string
   *   args:   // Arguments to the command - type: object
   *   qs:     // Opts as query string opts to the command --something - type: object
   *   files:  // files to be sent - type: string, buffer or array of strings or buffers
   *   buffer: // buffer the request before sending it - type: bool
   * }
   */
  var send = function send(options, callback) {
    if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
      return callback(new Error('no options were passed'));
    }

    return requestAPI(config, options, callback);
  };

  // Wraps the 'send' function such that an asynchronous
  // transform may be applied to its result before
  // passing it on to either its callback or promise.
  send.withTransform = function (transform) {
    return function (options, callback) {
      if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) !== 'object') {
        return callback(new Error('no options were passed'));
      }

      send(options, wrap(callback));

      function wrap(func) {
        if (func) {
          return function (err, res) {
            transform(err, res, send, func);
          };
        }
      }
    };
  };

  return send;
};