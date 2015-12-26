'use strict'

const scour = require('../../scour')

describe('.sortBy() dots', function () {
  const list =
    [ { u: { name: 'Wilma' } }, { u: { name: 'Barney' } }, { u: { name: 'Fred' } } ]

  const sortedList =
    [ { u: { name: 'Barney' } }, { u: { name: 'Fred' } }, { u: { name: 'Wilma' } } ]

  it('works for arrays via function', function () {
    const result = scour(list).sortBy('u.name')
    expect(result.value).toEqual(sortedList)
  })
})
