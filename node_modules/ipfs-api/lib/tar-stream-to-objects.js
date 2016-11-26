'use strict';

var tar = require('tar-stream');
var Readable = require('readable-stream');

// transform tar stream into readable stream of
// { path: 'string', content: Readable }
module.exports = function (err, res, send, done) {
  if (err) {
    return done(err);
  }

  var ex = tar.extract();
  res.pipe(ex);

  var objStream = new Readable({ objectMode: true });
  objStream._read = function noop() {};

  ex.on('entry', function (header, stream, next) {
    objStream.push({
      path: header.name,
      content: header.type !== 'directory' ? stream : null
    });
    next();
  });
  ex.on('finish', function () {
    objStream.push(null);
  });

  done(null, objStream);
};