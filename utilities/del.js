'use strict'

const clone = require('./clone')
const cloneWithout = require('./clone_without')

/**
 * Deletes a `keypath` from an `object` immutably.
 *
 *     data = { users: { bob: { name: 'robert' } } }
 *     result = del(data, ['users', 'bob', 'name'])
 *
 *     result = { users: { bob: {} } }
 */

module.exports = function del (object, keypath) {
  let results = {}
  let parents = {}

  for (let i = 0, len = keypath.length; i < len; i++) {
    if (i === 0) {
      parents[i] = object
    } else {
      parents[i] = parents[i - 1][keypath[i - 1]]
      if (!parents[i] || typeof parents[i] !== 'object') {
        return object
      }
    }
  }

  for (let i = keypath.length - 1; i >= 0; i--) {
    if (i === keypath.length - 1) {
      results[i] = cloneWithout(parents[i], keypath[i])
      delete results[i][keypath[i]]
    } else {
      results[i] = clone(parents[i])
      results[i][keypath[i]] = results[i + 1]
    }
  }

  return results[0]
}
