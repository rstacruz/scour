'use strict'

const scour = require('../../scour')

describe('.last()', function () {
  it('works for arrays', function () {
    const data = [ 'a', 'b' ]
    expect(scour(data).last().value).toEqual('b')
  })

  it('works for objects', function () {
    const data = { 0: 'a', 1: 'b' }
    expect(scour(data).last().value).toEqual('b')
  })

  it('works for empty arrays', function () {
    const data = []
    expect(scour(data).last()).toEqual(undefined)
  })

  it('works for empty objects', function () {
    const data = {}
    expect(scour(data).last()).toEqual(undefined)
  })
})
