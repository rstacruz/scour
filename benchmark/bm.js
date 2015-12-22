module.exports = function bm (suitename, options) {
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
