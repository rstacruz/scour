'use strict'

const scour = require('../../scour')

describe('.extend()', function () {
  it('works', function () {
    const data = { a: { b: 1 } }
    const result = scour(data).extend({ c: 2 })
    expect(result.value).toEqual({ a: { b: 1 }, c: 2 })
  })

  it('works in a scope', function () {
    const data = { a: { b: { c: 1 } } }
    const result = scour(data).go('a').extend({ b: 2 })
    expect(result.value).toEqual({ b: 2 })
  })

  it('spawns a new root', function () {
    const data = { a: { b: { c: 1 } } }
    const result = scour(data).go('a').extend({ b: 2 })
    expect(result.root.value).toEqual({ a: { b: 2 } })
  })

  it('overrides objects', function () {
    const data = { a: { b: 1 } }
    const result = scour(data).extend({ a: { c: 2 } })
    expect(result.value).toEqual({ a: { c: 2 } })
  })

  it('is chainable', function () {
    const data = { a: { b: 1 } }
    const result = scour(data).extend({ c: { d: 2 } })
    expect(result.go('c').get('d')).toEqual(2)
  })

  it('fails on non-objects', function () {
    expect(scour('hello').extend({ a: 1 })).toEqual(undefined)
  })

  it('fails on arrays', function () {
    const list = [ ]
    expect(scour(list).extend({ a: 1 })).toEqual(undefined)
  })

  it('fails on non-objects being passed as arguments', function () {
    expect(scour({}).extend('huh')).toEqual(undefined)
  })

  it('works in root', function () {
    const data = { a: { b: 1 } }
    const result = scour(data).extend({ c: { d: 2 } })

    expect(result.root).toBe(result)
  })
})

