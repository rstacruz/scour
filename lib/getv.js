/**
 * Internal: Helper to do `object[key] || defaultValue`, but allows for
 * undefined values as long as it's defined in `object`.
 */

module.exports = function getv (object, key, defaultValue) {
  return object && object.hasOwnProperty(key)
    ? object[key]
    : defaultValue
}
