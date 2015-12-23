/**
 * Clones an object but misses a key.
 */

module.exports = function cloneWithout (object, key) {
  if (Array.isArray(object)) {
    return object.slice(0, +key).concat(object.slice(+key + 1))
  } else {
    var result = {}
    key = '' + key
    for (var k in object) {
      if (object.hasOwnProperty(k) && key !== k) {
        result[k] = object[k]
      }
    }
    return result
  }
}
