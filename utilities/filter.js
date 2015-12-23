const forEach = require('./each')

module.exports = function filter (each, fn) {
  var isArray = Array.isArray(each)
  var result

  /* istanbul ignore next */
  if (typeof each !== 'function') each = forEach.bind(this, each)

  if (isArray) {
    result = []
    each(function (val, key) {
      if (fn.apply(this, arguments)) result.push(val)
    })
  } else {
    result = {}
    each(function (val, key) {
      if (fn.apply(this, arguments)) result[key] = val
    })
  }

  return result
}
