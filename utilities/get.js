'use strict'

module.exports = function get (object, keypath) {
  let result = object

  for (let i = 0, len = keypath.length; i < len; i++) {
    result = result[keypath[i]]
    if (!result) return result
  }

  return result
}
