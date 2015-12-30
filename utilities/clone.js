module.exports = function clone (object) {
  var assign = require('object-assign')
  return Array.isArray(object)
    ? [].slice.call(object)
    : assign({}, object)
}
