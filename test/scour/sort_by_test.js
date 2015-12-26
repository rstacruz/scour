'use strict'

const scour = require('../../scour')
const sortBy = require('../../utilities/sort_by')

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

  describe('in scour-wrapping', function () {
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

  describe('in standalone', function () {
    it('works for arrays via function', function () {
      const result = sortBy(list, (item) => item.name)
      expect(result).toEqual(sortedList)
    })

    it('works for objects via function', function () {
      const result = sortBy(object, (item) => item.name)
      expect(result).toEqual(sortedObject)
    })

    it('works for arrays via string', function () {
      const result = sortBy(list, 'name')
      expect(result).toEqual(sortedList)
    })

    it('works for objects via string', function () {
      const result = sortBy(object, 'name')
      expect(result).toEqual(sortedObject)
    })
  })
})
