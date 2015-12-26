const map = require('./map')
const forEach = require('./each')
const toFunction = require('to-function')
const sortValues = require('../lib/sort_values')

module.exports = function sortBy (each, condition, isArray) {
  if (typeof isArray === 'undefined' && !Array.isArray(each)) isArray = false
  if (typeof each !== 'function') each = forEach.bind(this, each)

  condition = toFunction(condition)

  var values = map(each, (value, key, index) => ({
    key, value, criteria: condition(value, key), index
  }))

  return sortValues(values, isArray)
}
