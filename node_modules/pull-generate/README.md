# pull-generate
A [pull-stream](https://github.com/dominictarr/pull-stream) source that produces data on state transitions

## Simple Example

``` js
var generate = require('pull-generate')
var pull = require('pull-stream')

pull(
    generate(0, function(state, cb) {
        cb(state>3 ? true : null, 1<<state, state + 1)
    }),
    pull.log()
)

// ==> 1 2 4 8
```

## Usage

### `generate(initialState, expand [, onAbort])`

- `expand`: function that is called with `initialstate` and a callback.
  - the callback has the following signature: `callback(err, data, newState)`
      - `err`
        - `null` to pass `data` downstream (normal operation)
        - `true` indicates the end of the stream
        - everything else is treated as an error
      - `data` is send downstream (only if err === null)
      - `newState` is used as `state` in the next call to `expand`.
- onAbort: optional function that is called after the stream ended
  - is called with `null` or an error object

## License
MIT
