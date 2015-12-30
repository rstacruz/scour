'use strict'

const test = require('tape')
const mapObject = require('../../utilities/map_object')
const scour = require('../../scour')

test('scour.mapObject()', (t) => {
  var input, result

  input = { a: 'hello', b: 'world' }
  result = mapObject(input, (val, key) => val.toUpperCase())
  t.deepEqual(result, { a: 'HELLO', b: 'WORLD' }, 'as standalone')

  input = { a: 'hello', b: 'world' }
  result = scour(input).mapObject((val, key) => val.value.toUpperCase())
  t.deepEqual(result, { a: 'HELLO', b: 'WORLD' }, 'when wrapped')

  t.end()
})
