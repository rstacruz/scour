'use strict'

const scour = require('../../scour')

describe('.del()', function () {
  it('works for root', function () {
    const data = { a: { b: 'foo' } }
    const result = scour(data).del([ 'a', 'b' ])

    expect(result.value).toEqual({ a: {} })
    expect(result.keypath).toEqual([])
  })

  it('allows dot notation', function () {
    const data = { a: { b: 'foo' } }
    const result = scour(data).del('a.b')

    expect(result.value).toEqual({ a: {} })
    expect(result.keypath).toEqual([])
  })

  describe('for non-root', function () {
    var data, root, a, result

    beforeEach(function () {
      data = { a: { b: { c: 'd' } } }
      root = scour(data)
      a = root.go('a')
      result = a.del('b')
    })

    it('works', function () {
      expect(result.value).toEqual({})
    })

    it('sets a new root', function () {
      expect(result.root.value).toEqual({ a: {} })
    })
  })
})

