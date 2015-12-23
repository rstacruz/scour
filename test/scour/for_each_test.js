'use strict'

const scour = require('../../scour')

describe('.forEach()', function () {
  it('works for arrays', function () {
    const data = [ { apple: true }, { banana: true } ]
    const result = []

    scour(data).forEach((item, key, idx) => result.push({ item, key, idx }))

    expect(result[0].item.value).toEqual({ apple: true })
    expect(result[0].key).toEqual(0)
    expect(result[0].idx).toEqual(0)

    expect(result[1].item.value).toEqual({ banana: true })
    expect(result[1].key).toEqual(1)
    expect(result[1].idx).toEqual(1)
  })

  it('works for objects', function () {
    const data = { a: { apple: true }, b: { banana: true } }
    const result = []

    scour(data).forEach((item, key, idx) => result.push({ item, key, idx }))

    expect(result[0].item.value).toEqual({ apple: true })
    expect(result[0].key).toEqual('a')
    expect(result[0].idx).toEqual(0)

    expect(result[1].item.value).toEqual({ banana: true })
    expect(result[1].key).toEqual('b')
    expect(result[1].idx).toEqual(1)
  })
})
