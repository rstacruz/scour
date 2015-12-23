'use strict'

const scour = require('../../scour')

describe('.gather()', function () {
  describe('works for arrays', function () {
    const data = [
      { name: 'David' },
      { name: 'Matt' },
      { name: 'Peter' }
    ]

    const result = scour(data).gather([0, 1])

    it('works', function () {
      expect(result.len()).toEqual(2)
    })

    it('has the correct .at(0)', function () {
      expect(result.at(0).value).toEqual({ name: 'David' })
    })
  })

  describe('works for objects', function () {
    const data = {
      10: { name: 'David' },
      11: { name: 'Matt' },
      12: { name: 'Peter' }
    }

    const result = scour(data).gather([ 10, 11 ])

    it('works', function () {
      expect(result.len()).toEqual(2)
    })

    it('has the correct .at(0)', function () {
      expect(result.value).toEqual({
        10: { name: 'David' },
        11: { name: 'Matt' }
      })
    })
  })

  describe('works for objects', function () {
    const data = {
      10: { name: 'David' },
      11: { name: 'Matt' },
      12: { name: 'Peter' }
    }

    const result = scour(data).gather([10, 11])

    it('works', function () {
      expect(result.len()).toEqual(2)
    })

    it('has the correct .at(0)', function () {
      expect(result.at(0).value).toEqual({ name: 'David' })
    })

    it('is still an object', function () {
      expect(result.get(10)).toEqual({ name: 'David' })
    })
  })
})
