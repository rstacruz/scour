'use strict'

const scour = require('../../scour')

const data = { a: 1, b: 2 }
const list = [ 'a', 'b' ]

describe('.len()', function () {
  it('works for objects', function () {
    expect(scour(data).len())
      .toEqual(Object.keys(data).length)
  })

  it('works for arrays', function () {
    expect(scour(list).len())
      .toEqual(list.length)
  })

  it('works for empties', function () {
    expect(scour([]).len())
      .toEqual(0)
  })

  it('works for undefined', function () {
    expect(scour(undefined).len())
      .toEqual(0)
  })
})

