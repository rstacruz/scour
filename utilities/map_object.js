var forEach = require('./each')

module.exports = function mapObject (each, fn) {
  if (typeof each !== 'function') each = forEach.bind(this, each)
  var result = {}
  each(function (val, key) { result[key] = fn.apply(this, arguments) })
  return result
}
