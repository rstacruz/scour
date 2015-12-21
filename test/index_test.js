'use strict'

var scour = require('../index')

describe('index', function () {
  const data = {
    users: {
      1: { name: 'john' },
      2: { name: 'jake' },
      3: { name: 'ara' }
    }
  }

  const list = [
    { name: 'apple' },
    { name: 'banana' }
  ]

  describe('.go()', function () {
    it('works', function () {
      const users = scour(data).go('users')
      expect(users.data).toBeAn('object')
      expect(Object.keys(users.data)).toInclude('1')
      expect(Object.keys(users.data)).toInclude('2')
    })

    it('gives keypath', function () {
      expect(scour(data).go('users').keypath).toEqual(['users'])
    })

    it('gives keypath (multiple keys)', function () {
      expect(scour(data).go('users', '1').keypath)
      .toEqual(['users', '1'])
    })

    it('stringifies keypaths', function () {
      expect(scour(data).go('users', 1).keypath)
      .toEqual(['users', '1'])
    })

    it('gives keypath (recursive)', function () {
      expect(scour(data).go('users').go('1').keypath)
      .toEqual(['users', '1'])
    })

    it('returns scalars', function () {
      expect(scour(data).go('users', '1', 'name')).toEqual('john')
    })
  })

  describe('.at()', function () {
    it('works', function () {
      expect(scour(data).go('users').at(0).go('name'))
        .toEqual('john')
    })

    it('works for arrays', function () {
      expect(scour(list).at(0).go('name'))
        .toEqual('apple')
    })
  })

  describe('.root', function () {
    it('is accessible', function () {
      const root = scour(data)
      expect(root.go('users', 1).root).toEqual(root)
    })
  })

  describe('.extend()', function () {
    const extension = {
      fullname () { return 'Mr. ' + this.go('name') }
    }

    it('works', function () {
      let user = scour(data).go('users', 1)
        .extend(extension)

      expect(user.fullname()).toEqual('Mr. john')
    })

    it('gets carried over', function () {
      let user = scour(data)
        .extend(extension)
        .go('users', 1)

      expect(user.fullname()).toEqual('Mr. john')
    })
  })

  describe('.each()', function () {
    it('works', function () {
      const results = []

      scour(data).go('users').each((val, key) => {
        results.push([ val.data, key ])
      })

      expect(results[0]).toEqual([ { name: 'john' }, '1' ])
      expect(results[1]).toEqual([ { name: 'jake' }, '2' ])
    })
  })

  describe('.len()', function () {
    it('works for objects', function () {
      expect(scour(data).len())
        .toEqual(Object.keys(data).length)
    })

    it('works for arrays', function () {
      expect(scour(list).len())
        .toEqual(list.length)
    })
  })

  describe('.where()', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').where({ name: { $regex: /^j/ } })
    })

    it('has results', function () {
      expect(this.results.go(1).data).toEqual({ name: 'john' })
      expect(this.results.go(2).data).toEqual({ name: 'jake' })
      expect(this.results.go(3)).toEqual(undefined)
    })
  })

  describe('.where() again', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').where({ name: { $regex: /^a/ } })
    })

    it('has results indexed by id', function () {
      expect(this.results.go(3).data).toEqual({ name: 'ara' })
    })

    it('has proper keypaths', function () {
      expect(this.results.go(3).keypath).toEqual([ 'users', '3' ])
    })
  })

  describe('.where()', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').where({ name: { $regex: /^j/ } })
    })

    it('works', function () {
      expect(this.results.go(1).data).toEqual({ name: 'john' })
      expect(this.results.go(2).data).toEqual({ name: 'jake' })
      expect(this.results.go(3)).toEqual(undefined)
    })
  })

  describe('.where() empty', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').where({ abc: 'def' })
    })

    it('works', function () {
      expect(this.results.len()).toEqual(0)
    })
  })

  describe('.find()', function () {
    beforeEach(function () {
      this.result = scour(data).go('users').find({ name: { $regex: /^j/ } })
    })

    it('works', function () {
      expect(this.result.data).toEqual({ name: 'john' })
    })
  })

  describe('.find() empty', function () {
    beforeEach(function () {
      this.result = scour(data).go('users').find({ abc: 'def' })
    })

    it('works', function () {
      expect(this.result).toEqual(undefined)
    })
  })

  describe('.map()', function () {
    it('works', function () {
      const results =
        scour(data).go('users').map((val, key) => {
          return [val.data, key]
        })

      expect(results[0]).toEqual([ { name: 'john' }, '1' ])
      expect(results[1]).toEqual([ { name: 'jake' }, '2' ])
    })
  })

  describe('arrays', function () {
    beforeEach(function () {
      this.root = scour(list)
    })

    it('.go()', function () {
      expect(this.root.go('0').data).toEqual({ name: 'apple' })
    })

    it('.go(...)', function () {
      expect(this.root.go('0', 'name')).toEqual('apple')
    })

    it('.data', function () {
      expect(this.root.data).toEqual(list)
    })

    it('.map()', function () {
      expect(this.root.map((f) => f.go('name'))).toEqual(['apple', 'banana'])
    })
  })

  describe('edge cases: strings', function () {
    beforeEach(function () {
      this.root = scour('hey')
    })

    it('.go()', function () {
      expect(this.root.go('0')).toEqual('h')
    })

    it('.data', function () {
      expect(this.root.data).toEqual('hey')
    })

    it('.map()', function () {
      expect(this.root.map((n) => n)).toEqual(['h', 'e', 'y'])
    })
  })
})
