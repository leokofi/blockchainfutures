pull = require('pull').set('git@github.com:ramitos/blog.git', __dirname + '/articles', function () {
	pull.sync()
})