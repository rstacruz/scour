var assign = require('object-assign')

var defaults = {
  onStart: function (suitename) { console.log(suitename) },
  onStep: function (key) { },
  onStepEnd: function (key, result) { console.log('    x ' + result.rate + ' op/sec - ' + key) },
  onError: function (err) { console.error(err.stack) }
}

function bm (suitename, steps, options) {
  options = assign({}, defaults, options)
  if (!options) options = {}
  options.onStart(suitename, steps, options)
  for (var key in steps) {
    if (!steps.hasOwnProperty(key)) continue
    try {
      options.onStep(key)
      var result = bm.runBenchmark(steps[key])
      options.onStepEnd(key, result)
    } catch (err) {
      options.onError(err)
    }
  }
}

bm.timeout = 3

bm.runBenchmark = function runBenchmark (fn) {
  var start = +new Date()
  var timeout = bm.timeout
  var elapsed
  var iterations = 0

  while (true) {
    fn()
    iterations += 1
    elapsed = (+new Date() - start) / 1000
    if (elapsed > timeout) break
  }

  var time = elapsed
  var rate = iterations / time

  return { time: time, rate: Math.round(rate), iterations: iterations }
}

module.exports = bm
