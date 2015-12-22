
function bm (suitename, options) {
  var Benchmark = require('benchmark')
  var suite = new Benchmark.Suite(suitename)

  for (var key in options) {
    if (!options.hasOwnProperty(key)) continue
    suite = suite.add(key, options[key])
  }

  suite.on('start', function (event) {
    console.log(suitename)
  })

  suite.on('cycle', function (event) {
    console.log('  ' + String(event.target))
  })

  suite.on('error', function (e) {
    console.log(e.target.error.stack)
  })

  suite.on('complete', function () {
  })

  suite.run({ async: true, maxTime: 2 })
}

keypath = ['users', '12', 'photos']
extensions = {
  '': {},
  'users.*': {},
  '*.foo': {},
  'foo': {},
  'cinemas': {},
  'galleries': {}
}

keypathExprs = [
  'users.12.photos', 'users.12.*',
  'users.*.photos', 'users.*.*',
  '*.12.photos', '*.12.*',
  '*.*.photos', '*.*.*'
]

exprs = Object.keys(extensions).map((key) => {
  return new RegExp('^' +
    key
    .replace(/\./g, '\\.')
    .replace(/\*/g, '[^\.]+') + '$')
})

bm('matching', {
  'via regexp': function () {
    var path = keypath.join('.')
    exprs.forEach((expr) => {
      expr.test(path)
    })
  },
  'iteration': function () {
    var path = keypath.join('.')
    keypathExprs.forEach((expr) => {
      if (extensions[keypathExprs]) { console.log('yay') }
    })
  }
})
