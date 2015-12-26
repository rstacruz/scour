const indexedMap = require('../utilities/indexed_map')
const map = require('../utilities/map')

/*
 * Internal: Sorts a `{ key, value, criteria, index }` tuple array by
 * `criteria`. Returns the array of values if `isArray` is not `false`,
 * or an object indexed by `key` otherwise.
 */

module.exports = function sortValues (values, isArray) {
  var sorted = values.sort((left, right) => {
    const a = left.criteria
    const b = right.criteria
    if (a !== b) {
      if (a > b || a === void 0) return 1
      if (a < b || b === void 0) return -1
    }
    return a.index - b.index
  })

  if (isArray === false) {
    return indexedMap(sorted, (res) => [ res.key, res.value ])
  } else {
    return map(sorted, (res) => res.value)
  }
}
