const forEach = require('./each')

module.exports = function indexedMap (each, fn) {
  if (typeof each !== 'function') each = forEach.bind(this, each)
  const result = {}
  each(function () {
    const item = fn.apply(this, arguments)
    result[item[0]] = item[1]
  })
  return result
}
