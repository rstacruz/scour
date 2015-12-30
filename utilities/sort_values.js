var indexedMap = require('../utilities/indexed_map')
var map = require('../utilities/map')

/*
 * Internal: Sorts a `{ key, value, criteria, index }` tuple array by
 * `criteria`. Returns the array of values if `isArray` is not `false`,
 * or an object indexed by `key` otherwise.
 */

module.exports = function sortValues (values, isArray) {
  var sorted = values.sort(function (left, right) {
    var a = left.criteria
    var b = right.criteria
    if (a !== b) {
      if (a > b || a === void 0) return 1
      if (a < b || b === void 0) return -1
    }
    return a.index - b.index
  })

  if (isArray === false) {
    return indexedMap(sorted, function (res) { return [ res.key, res.value ] })
  } else {
    return map(sorted, function (res) { return res.value })
  }
}
