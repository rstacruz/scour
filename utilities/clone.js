module.exports = function clone (object) {
  const assign = require('object-assign')
  return Array.isArray(object)
    ? [].slice.call(object)
    : assign({}, object)
}
