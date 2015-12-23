'use strict'

const scour = require('../../scour')

describe('.sortBy()', function () {
  const object =
    { wilma: { name: 'Wilma' },
      barney: { name: 'Barney' },
      fred: { name: 'Fred' } }

  const sortedObject =
    { barney: { name: 'Barney' },
      fred: { name: 'Fred' },
      wilma: { name: 'Wilma' } }

  const list =
    [ { name: 'Wilma' }, { name: 'Barney' }, { name: 'Fred' } ]

  const sortedList =
    [ { name: 'Barney' }, { name: 'Fred' }, { name: 'Wilma' } ]

  it('works for arrays via function', function () {
    const result = scour(list).sortBy((item) => item.get('name'))
    expect(result.value).toEqual(sortedList)
  })

  it('works for objects via function', function () {
    const result = scour(object).sortBy((item) => item.get('name'))
    expect(result.value).toEqual(sortedObject)
  })

  it('works for arrays via string', function () {
    const result = scour(list).sortBy('name')
    expect(result.value).toEqual(sortedList)
  })

  it('works for objects via string', function () {
    const result = scour(object).sortBy('name')
    expect(result.value).toEqual(sortedObject)
  })
})
