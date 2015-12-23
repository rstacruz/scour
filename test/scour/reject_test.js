'use strict'

const scour = require('../../scour')

describe('.reject()', function () {
  it('works for objects/functions', function () {
    const data = { a: 10, b: 11, c: 12, d: 13 }
    const result = scour(data).reject((item) => item.value % 2 === 1)

    expect(result.value).toEqual({ a: 10, c: 12 })
  })

  it('works for objects/objects', function () {
    const data = { a: { num: 10 }, b: { num: 11 } }
    const result = scour(data).reject({ num: 10 })

    expect(result.value).toEqual({ b: { num: 11 } })
  })

  it('works for objects/queries', function () {
    const data = { a: { num: 10 }, b: { num: 11 } }
    const result = scour(data).reject({ num: { $eq: 11 } })

    expect(result.value).toEqual({ a: { num: 10 } })
  })
})
