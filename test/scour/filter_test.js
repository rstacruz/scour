'use strict'

const scour = require('../../scour')

const data = {
  users: {
    1: { name: 'john' },
    2: { name: 'jake' },
    3: { name: 'ara' }
  }
}

describe('.filter()', function () {
  beforeEach(function () {
    this.results = scour(data).go('users').filter({ name: { $regex: /^j/ } })
  })

  it('works', function () {
    expect(this.results.go(1).value).toEqual({ name: 'john' })
    expect(this.results.go(2).value).toEqual({ name: 'jake' })
    expect(this.results.go(3)).toEqual(undefined)
  })

  describe('on objects', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').filter({ name: { $regex: /^a/ } })
    })

    it('has results indexed by id', function () {
      expect(this.results.go(3).value).toEqual({ name: 'ara' })
    })

    it('has proper keypaths', function () {
      expect(this.results.go(3).keypath).toEqual([ 'users', '3' ])
    })
  })

  describe('on empties', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').filter({ abc: 'def' })
    })

    it('works', function () {
      expect(this.results.len()).toEqual(0)
    })
  })
})
