'use strict'

const each = require('../../utilities/each')

describe('each', function () {
  it('works with arrays', function () {
    var values = ''
    each([7, 8, 9], function (val) { values += '.' + val })
    expect(values).toEqual('.7.8.9')
  })

  it('works with array keys', function () {
    var keys = ''
    each([9, 9, 9], function (_, key) { keys += '.' + key })
    expect(keys).toEqual('.0.1.2')
  })

  it('works with objects', function () {
    var values = ''
    each({ a: 8, b: 9 }, function (val) { values += '.' + val })
    expect(values).toEqual('.8.9')
  })

  it('works with objects with non-enumerable properties', function () {
    var values = ''
    var input = { a: 8, b: 9 }
    Object.defineProperty(input, 'sue', { enumerable: false, value: 4 })
    expect(input.sue).toEqual(4)

    each(input, function (val) { values += '.' + val })
    expect(values).toEqual('.8.9')
  })

  it('works with object keys', function () {
    var keys = ''
    each({ a: 1, b: 2 }, function (_, key) { keys += '.' + key })
    expect(keys).toEqual('.a.b')
  })

  describe('without native fallback', function () {
    before(function () {
      delete each.native
    })

    after(function () {
      each.native = Array.prototype.forEach
    })

    it('works with arrays', function () {
      var values = ''
      each([7, 8, 9], function (val) { values += '.' + val })
      expect(values).toEqual('.7.8.9')
    })
  })
})
