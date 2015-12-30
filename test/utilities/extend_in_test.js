'use strict'

const test = require('tape')
const extendIn = require('../../utilities/extend_in')

test('scour.extendIn()', (t) => {
  var data, result

  data = { a: { b: { c: 1 } } }
  result = extendIn(data, ['a', 'b'], { z: 9 })

  t.deepEqual(
    result, { a: { b: { c: 1, z: 9 } } },
    'works')

  data = { a: { b: { c: 1 } } }
  result = extendIn(data, [], { z: 9 })

  t.deepEqual(
    result, { a: { b: { c: 1 } }, z: 9 },
    'with keypath length = 0')

  t.end()
})
