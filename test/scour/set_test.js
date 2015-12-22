'use strict'

const scour = require('../../scour')

describe('set', function () {
  it('works with wrapping', function () {
    const a = scour({ a: true })
    const b = scour({ b: true })

    const result = a.set('c', b)

    expect(result.value).toEqual({ a: true, c: { b: true } })
  })
})
