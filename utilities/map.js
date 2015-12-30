var forEach = require('./each')

module.exports = function map (each, fn) {
  if (typeof each !== 'function') each = forEach.bind(this, each)
  var result = []
  each(function () { result.push(fn.apply(this, arguments)) })
  return result
}
