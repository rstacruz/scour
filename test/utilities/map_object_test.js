'use strict'

const mapObject = require('../../utilities/map_object')

describe('map object', function () {
  it('works', function () {
    var input = { a: 'hello', b: 'world' }
    var result = mapObject(input, (val, key) => val.toUpperCase())

    expect(result).toEqual({ a: 'HELLO', b: 'WORLD' })
  })
})
