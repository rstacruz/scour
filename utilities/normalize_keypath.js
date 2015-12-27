/**
 * Internal: normalizes a keypath, allowing dot syntax, and normalizing them
 * all to strings.
 *
 *     normalizeKeypath('user.12.name')  // => ['user', '12', 'name']
 *     normalizeKeypath(['user', 12])    // => ['user', 12]
 */

module.exports = function normalizeKeypath (keypath, isArguments) {
  if (typeof keypath === 'string') {
    return keypath.split('.')
  } else if (isArguments && keypath.length === 1) {
    if (Array.isArray(keypath[0])) return keypath[0].map((k) => '' + k)
    if (typeof keypath[0] === 'number') return [ '' + keypath[0] ]
    return ('' + keypath[0]).split('.')
  } else {
    if (isArguments) keypath = Array.prototype.slice.call(keypath)
    return keypath.map((k) => '' + k)
  }
}
