'use strict'

const filter = require('../../utilities/filter')

describe('filter', function () {
  it('works for objects', function () {
    var input = { a: 10, b: 11, c: 12 }
    var result = filter(input, (val) => val % 2 === 0)

    expect(result).toEqual({ a: 10, c: 12 })
  })

  it('works for arrays', function () {
    var input = [ 10, 11, 12 ]
    var result = filter(input, (val) => val % 2 === 0)

    expect(result).toEqual([ 10, 12 ])
  })
})
