'use strict'

const indexedMap = require('../../utilities/indexed_map')
const scour = require('../../scour')

describe('indexedMap', function () {
  it('works', function () {
    var input = { a: 'hello', b: 'world' }
    var result = indexedMap(input, (val, key) => [ '_' + key, val.toUpperCase() ])

    expect(result).toEqual({ _a: 'HELLO', _b: 'WORLD' })
  })

  it('works as wrapped', function () {
    var input = { a: 'hello', b: 'world' }
    var result = scour(input)
      .indexedMap((val, key) => [ '_' + key, val.value.toUpperCase() ])

    expect(result).toEqual({ _a: 'HELLO', _b: 'WORLD' })
  })
})
