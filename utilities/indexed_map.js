var forEach = require('./each')

module.exports = function indexedMap (each, fn) {
  /* istanbul ignore next */
  if (typeof each !== 'function') each = forEach.bind(this, each)
  var result = {}
  each(function () {
    var item = fn.apply(this, arguments)
    result[item[0]] = item[1]
  })
  return result
}
