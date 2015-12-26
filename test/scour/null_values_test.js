'use strict'

const scour = require('../../scour')

describe('null values', function () {
  const nil = scour(null)

  it('len()', function () {
    expect(nil.len()).toEqual(0)
  })

  it('get()', function () {
    expect(nil.get('foo')).toEqual(undefined)
  })

  it('getAt()', function () {
    expect(nil.getAt('foo')).toEqual(undefined)
  })

  it('at()', function () {
    expect(nil.at('foo').value).toEqual(undefined)
  })

  it('first()', function () {
    expect(nil.first().value).toEqual(undefined)
  })

  it('last()', function () {
    expect(nil.last().value).toEqual(undefined)
  })

  it('keys()', function () {
    expect(nil.keys()).toEqual([])
  })

  it('go()', function () {
    expect(nil.go('foo').value).toEqual(undefined)
  })

  it('each()', function () {
    expect(nil.each(function (val, key) {
    }))
  })

  it('map()', function () {
    expect(nil.map((n) => n)).toEqual([])
  })

  it('filter()', function () {
    expect(nil.filter({}).value).toEqual([])
  })

  it('reject()', function () {
    expect(nil.filter({}).value).toEqual([])
  })
})
