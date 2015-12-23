'use strict'

const scour = require('../../scour')

describe('.filter() (simple)', function () {
  it('works for objects/functions', function () {
    const data = { a: 10, b: 11, c: 12, d: 13 }
    const result = scour(data).filter((item) => item.value % 2 === 0)

    expect(result.value).toEqual({ a: 10, c: 12 })
  })

  it('works for objects/objects', function () {
    const data = { a: { num: 10 }, b: { num: 11 }, c: { num: 12 } }
    const result = scour(data).filter({ num: 11 })

    expect(result.value).toEqual({ b: { num: 11 } })
  })

  it('works for objects/queries', function () {
    const data = { a: { num: 10 }, b: { num: 11 }, c: { num: 12 } }
    const result = scour(data).filter({ num: { $eq: 11 } })

    expect(result.value).toEqual({ b: { num: 11 } })
  })
})
