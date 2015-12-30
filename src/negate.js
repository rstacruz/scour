/**
 * Internal: decorates a function by inverting its result.
 */

module.exports = function negate (fn) {
  return function () { return !fn.apply(this, arguments) }
}
