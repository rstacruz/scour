'use strict'

const extendIn = require('../../utilities/extend_in')

describe('extend in', function () {
  it('works', function () {
    var data = { a: { b: { c: 1 } } }
    var result = extendIn(data, ['a', 'b'], { z: 9 })

    expect(result).toEqual({ a: { b: { c: 1, z: 9 } } })
  })

  it('works with keypath length = 0', function () {
    var data = { a: { b: { c: 1 } } }
    var result = extendIn(data, [], { z: 9 })

    expect(result).toEqual({ a: { b: { c: 1 } }, z: 9 })
  })
})
