const forEach = require('./each')

module.exports = function mapObject (each, fn) {
  /* istanbul ignore next */
  if (typeof each !== 'function') each = forEach.bind(this, each)
  const result = {}
  each(function (val, key) { result[key] = fn.apply(this, arguments) })
  return result
}
