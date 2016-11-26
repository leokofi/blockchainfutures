var generate = require('./')
var pull = require('pull-stream')

pull(
    generate(0, function(state, cb) {
        cb(state>3 ? true : null, state + 1, 1<<state)
    }),
    pull.log()
)
