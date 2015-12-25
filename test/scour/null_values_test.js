'use strict'

const scour = require('../../scour')

describe('null values', function () {
  const nil = scour(null)

  it('len()', function () {
    expect(nil.len()).toEqual(0)
  })

  it('each()', function () {
    expect(nil.each(function (val, key) {
    }))
  })

  it('map()', function () {
    expect(nil.map((n) => n)).toEqual([])
  })
})
