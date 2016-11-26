// jshint -W033, -W041
// originally copied from pull-stream/test/readarray.js

var tape       = require('tape')

var pull      = require('pull-stream')
var sources    = require('pull-stream/sources')
var sinks      = require('pull-stream/sinks')

var generate  = require('../')

var pipeableSource = pull.pipeableSource
var pipeable       = pull.pipeable
var pipeableSink   = pull.pipeableSink

function arrayReader (read, cb) {
  var array = []
  read(null, function next (end, data) {
    
    if(end)
      return cb(end === true ? null : end, array)

    array.push(data)
    read(null, next)
  })
}

tape('basics', function (t) {
  var read = generate(1, function(state, cb) {
    cb(state>3 ? true : null, state, state + 1)
  })
  read(null, function (e, d) {
    t.ok(e == null, 'nullish')
    t.equal(d, 1)
    read(null, function (e, d) {
      t.ok(e == null, 'nullish')
      t.equal(d, 2)
      read(null, function (e, d) {
        t.ok(e == null, 'nullish')
        t.equal(d, 3)
        read(null, function (e, d) {
          t.equal(e, true)
          t.ok(d == null, 'nullish')
          t.end()
        })
      })
    })
  })
})

tape('generate', function (t) {
  var array = [1, 2, 3]
  var read = generate(1, function(state, cb) {
    cb(state>3 ? true : null, state, state + 1)
  })
  arrayReader(read, function (err, _array) {
      console.log('END?')
      t.deepEqual(_array, array)
      t.end()
    })
})

tape('pipe', function (t) {
  var array = [1, 2, 3]
  var read = pipeableSource(generate)(1, function(state, cb) {
    cb(state>3 ? true : null, state, state + 1)
  })
 
  t.equal('function', typeof read)
  t.equal('function', typeof read.pipe)

  read.pipe(pipeableSink(arrayReader)(function (err, _array) {
    t.equal(err, null)
    t.deepEqual(_array, array)
    t.end()
  }))
})

tape('pipe2', function (t) {
  var array = [1, 2, 3]
  var read = pipeableSource(generate)(1, function(state, cb) {
    cb(state>3 ? true : null, state, state + 1)
  })
  arrayWriter = pull.writeArray

  t.equal('function', typeof read)
  t.equal('function', typeof read.pipe)

  read
    .pipe(function (read) {
      return function (end, cb) {
        read(end, function (end, data) {
          console.log(end, data)
          cb(end, data != null ? data * 2 : null)
        })
      }
    })
    .pipe(arrayWriter(function (err, _array) {
      console.log(_array)
      t.equal(err, null)
      t.deepEqual(_array, array.map(function (e) {
        return e * 2
      }))
      t.end()
    }))

})

tape('passes expand err downstream', function (t) {
  var err = new Error('boom'), endErr
  var onEndCount = 0
  var read = generate(1, function(state, cb) {
    cb(state>3 ? err : null, state, state + 1)
  }, function(endErr) {
    console.log('onEnd')
    onEndCount++
    t.equal(endErr, err)
    t.equal(onEndCount, 1)
    process.nextTick(function() {
      t.end()
    })
  })
  read(null, function (e, d) {
    t.ok(e == null, 'nullish')
    t.equal(d, 1)
    read(null, function (e, d) {
      t.ok(e == null, 'nullish')
      t.equal(d, 2)
      read(null, function (e, d) {
        t.ok(e == null, 'nullish')
        t.equal(d, 3)
        read(null, function (e, d) {
          t.equal(e, err)
          t.ok(d == null, 'nullish')
          read(null, function (e, d) {
            console.log('end')
            t.equal(e, err)
            t.ok(d == null, 'nullish')
          })
        })
      })
    })
  })
})


