'use strict'

const scour = require('../../scour')

describe('.first()', function () {
  it('works for arrays', function () {
    const data = [ 'a', 'b' ]
    expect(scour(data).first().value).toEqual('a')
  })

  it('works for objects', function () {
    const data = { 0: 'a', 1: 'b' }
    expect(scour(data).first().value).toEqual('a')
  })

  it('works for empty arrays', function () {
    const data = []
    expect(scour(data).first()).toEqual(undefined)
  })

  it('works for empty objects', function () {
    const data = {}
    expect(scour(data).first()).toEqual(undefined)
  })
})
