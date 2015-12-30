'use strict'

const test = require('tape')
const scour = require('../../scour')

test('.filter() via function', (t) => {
  var data, result

  data = { a: 10, b: 11, c: 12 }
  result = scour(data).filter((val, key) => val.value % 2 === 0)
  t.deepEqual(result.value, { a: 10, c: 12 }, 'for objects')

  data = [ 10, 11, 12 ]
  result = scour(data).filter((val, key) => val.value % 2 === 0)
  t.deepEqual(result.value, [ 10, 12 ], 'for arrays')

  t.end()
})
