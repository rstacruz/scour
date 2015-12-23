'use strict'

const mapObject = require('../../utilities/map_object')
const scour = require('../../scour')

describe('map object', function () {
  it('works', function () {
    var input = { a: 'hello', b: 'world' }
    var result = mapObject(input, (val, key) => val.toUpperCase())

    expect(result).toEqual({ a: 'HELLO', b: 'WORLD' })
  })

  it('works as wrapped', function () {
    var input = { a: 'hello', b: 'world' }
    var result = scour(input).mapObject((val, key) => val.value.toUpperCase())

    expect(result).toEqual({ a: 'HELLO', b: 'WORLD' })
  })
})
