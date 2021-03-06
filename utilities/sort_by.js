var map = require('./map')
var forEach = require('./each')
var toFunction = require('to-function')
var sortValues = require('./sort_values')

module.exports = function sortBy (each, condition, isArray) {
  if (typeof isArray === 'undefined' && !Array.isArray(each)) isArray = false
  if (typeof each !== 'function') each = forEach.bind(this, each)

  condition = toFunction(condition)

  var values = map(each, function (value, key, index) {
    return { key: key, value: value, criteria: condition(value, key), index: index }
  })

  return sortValues(values, isArray)
}
