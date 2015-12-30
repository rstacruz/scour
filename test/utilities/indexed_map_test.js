'use strict'

const test = require('tape')
const indexedMap = require('../../utilities/indexed_map')
const scour = require('../../src')

test('scour.indexedMap()', (t) => {
  var input, result

  input = { a: 'hello', b: 'world' }
  result = indexedMap(input, (val, key) => [ '_' + key, val.toUpperCase() ])

  t.deepEqual(
    result, { _a: 'HELLO', _b: 'WORLD' },
    'as standalone')

   input = { a: 'hello', b: 'world' }
   result = scour(input)
    .indexedMap((val, key) => [ '_' + key, val.value.toUpperCase() ])

  t.deepEqual(
    result,{ _a: 'HELLO', _b: 'WORLD' },
    'when wrapped')

  t.end()
})
