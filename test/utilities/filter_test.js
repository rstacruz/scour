'use strict'

const test = require('tape')
const filter = require('../../utilities/filter')

test('scour.filter()', (t) => {
  var input, result

  input = { a: 10, b: 11, c: 12 }
  result = filter(input, (val) => val % 2 === 0)

  t.deepEqual(result, { a: 10, c: 12 }, 'for objects')

  input = [ 10, 11, 12 ]
  result = filter(input, (val) => val % 2 === 0)

  t.deepEqual(result, [ 10, 12 ], 'for arrays')

  t.end()
})
