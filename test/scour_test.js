'use strict'

var scour = require('../scour')

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

  describe('.go() and .get()', function () {
    it('works', function () {
      const users = scour(data).go('users')
      expect(users.value).toBeAn('object')
      expect(Object.keys(users.value)).toInclude('1')
      expect(Object.keys(users.value)).toInclude('2')
    })

    it('gives keypath', function () {
      expect(scour(data).go('users').keypath).toEqual(['users'])
    })

    it('allows calling .get() with nothing', function () {
      expect(scour(data).get()).toEqual(data)
    })

    it('allows dot notation', function () {
      expect(scour(data).go('users.1').keypath)
      .toEqual(['users', '1'])
    })

    it('allows arrays', function () {
      expect(scour(data).go(['users', '1']).keypath)
        .toEqual(['users', '1'])
    })

    it('allows arrays with numbers', function () {
      expect(scour(data).go(['users', 1]).keypath)
        .toEqual(['users', '1'])
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

    it('allows traversing to strings', function () {
      expect(scour(data).go('users', '1', 'name').value)
        .toEqual('john')
    })
  })

  describe('.at()', function () {
    it('works', function () {
      expect(scour(data).go('users').at(0).get('name'))
        .toEqual('john')
    })

    it('works for arrays', function () {
      expect(scour(list).at(0).get('name'))
        .toEqual('apple')
    })
  })

  describe('.first()', function () {
    it('works for arrays', function () {
      const data = [ 'a', 'b' ]
      expect(scour(data).first().value).toEqual('a')
    })

    it('works for objects', function () {
      const data = { 0: 'a', 1: 'b' }
      expect(scour(data).first().value).toEqual('a')
    })

    it('works for empty arrays', function () {
      const data = []
      expect(scour(data).first()).toEqual(undefined)
    })

    it('works for empty objects', function () {
      const data = {}
      expect(scour(data).first()).toEqual(undefined)
    })
  })

  describe('.last()', function () {
    it('works for arrays', function () {
      const data = [ 'a', 'b' ]
      expect(scour(data).last().value).toEqual('b')
    })

    it('works for objects', function () {
      const data = { 0: 'a', 1: 'b' }
      expect(scour(data).last().value).toEqual('b')
    })

    it('works for empty arrays', function () {
      const data = []
      expect(scour(data).last()).toEqual(undefined)
    })

    it('works for empty objects', function () {
      const data = {}
      expect(scour(data).last()).toEqual(undefined)
    })
  })

  describe('.toArray()', function () {
    it('works for objects', function () {
      expect(scour({ a: 1, b: 2 }).toArray()).toEqual([1, 2])
    })

    it('works for objects with .values()', function () {
      expect(scour({ a: 1, b: 2 }).values()).toEqual([1, 2])
    })

    it('works for arrays', function () {
      expect(scour(list).toArray()).toEqual(list)
    })

    it('works for strings', function () {
      expect(scour('12').toArray()).toEqual(['1', '2'])
    })

    it('works for numbers', function () {
      expect(scour(12).toArray()).toEqual([])
    })

    it('works for undefined', function () {
      expect(scour(undefined).toArray()).toEqual([])
    })

    it('works for null', function () {
      expect(scour(null).toArray()).toEqual([])
    })
  })

  describe('.toString()', function () {
    it('works', function () {
      expect(scour({ a: 1 }).toString()).toBeA('string')
    })
  })

  describe('.root', function () {
    it('is accessible', function () {
      const root = scour(data)
      expect(root.go('users', 1).root).toEqual(root)
    })
  })

  describe('.use()', function () {
    const data = { users: { 1: { name: 'john' } } }

    function fullname () {
      return 'Mr. ' + this.get('name')
    }

    it('works', function () {
      let user = scour(data)
        .use({ 'users.*': { fullname } })
        .go('users', 1)

      expect(user.fullname()).toEqual('Mr. john')
    })

    it('works for root', function () {
      const db = scour(data)
        .use({ '': { users } })

      expect(db.users().get('1.name')).toEqual('john')

      function users () { return this.go('users') }
    })

    it('works for double stars on root', function () {
      const db = scour(data)
        .use({ '**': { users } })

      expect(db.users().get('1.name')).toEqual('john')

      function users () { return this.go('users') }
    })

    it('works for double stars on non-root', function () {
      const db = scour(data)
        .use({ '**': { fullname } })

      expect(db.go('users.1').fullname()).toEqual('Mr. john')
    })

    it('gets carried over', function () {
      let user = scour(data)
        .use({ 'users.*': { fullname } })
        .go('users').go(1)

      expect(user.fullname()).toEqual('Mr. john')
    })

    it('works on scoped objects', function () {
      let user = scour(data)
        .go('users')
        .use({ '*': { fullname } })
        .go(1)

      expect(user.fullname()).toEqual('Mr. john')
    })

    it('gets carried over to new root', function () {
      let user = scour(data)
        .go('users')
        .use({ '*': { fullname } })
        .root
        .go('users').go(1)

      expect(user.fullname()).toEqual('Mr. john')
    })

    it('stacks', function () {
      let user = scour(data)
        .use({ 'users.*': { fullname } })
        .use({ 'users.*': {
          greeting: function () {
            return `Hello, ${this.fullname()}`
          }
        } })
        .go('users', 1)

      expect(user.greeting()).toEqual('Hello, Mr. john')
    })
  })

  describe('.each()', function () {
    it('works', function () {
      const results = []

      scour(data).go('users').each((val, key) => {
        results.push([ val.value, key ])
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

    it('works for undefined', function () {
      expect(scour(undefined).len())
        .toEqual(0)
    })
  })

  describe('.filter()', function () {
    beforeEach(function () {
      this.results = scour(data).go('users').filter({ name: { $regex: /^j/ } })
    })

    it('has results', function () {
      expect(this.results.go(1).value).toEqual({ name: 'john' })
      expect(this.results.go(2).value).toEqual({ name: 'jake' })
      expect(this.results.go(3)).toEqual(undefined)
    })
  })

  describe('.filter() again', function () {
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

  describe('.find()', function () {
    beforeEach(function () {
      this.result = scour(data).go('users').find({ name: { $regex: /^j/ } })
    })

    it('works', function () {
      expect(this.result.value).toEqual({ name: 'john' })
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
          return [val.value, key]
        })

      expect(results[0]).toEqual([ { name: 'john' }, '1' ])
      expect(results[1]).toEqual([ { name: 'jake' }, '2' ])
    })
  })

  describe('arrays', function () {
    beforeEach(function () {
      this.root = scour(list)
    })

    it('.get()', function () {
      expect(this.root.go('0').value).toEqual({ name: 'apple' })
    })

    it('.get(...)', function () {
      expect(this.root.get('0', 'name')).toEqual('apple')
    })

    it('.value', function () {
      expect(this.root.value).toEqual(list)
    })

    it('.map()', function () {
      expect(this.root.map((f) => f.get('name'))).toEqual(['apple', 'banana'])
    })
  })

  describe('edge cases: strings', function () {
    beforeEach(function () {
      this.root = scour('hey')
    })

    it('.go()', function () {
      expect(this.root.get('0')).toEqual('h')
    })

    it('.value', function () {
      expect(this.root.value).toEqual('hey')
    })

    it('.map()', function () {
      expect(this.root.map((n) => n.value)).toEqual(['h', 'e', 'y'])
    })
  })

  describe('.toJSON()', function () {
    it('works', function () {
      expect(JSON.stringify(scour(data)))
        .toEqual(JSON.stringify(data))
    })
  })

  describe('scour.*', function () {
    it('.map() works', function () {
      const input = { a: 10, b: 20, c: 30 }
      const output = scour.map(input, (val) => val / 10)
      expect(output).toEqual([ 1, 2, 3 ])
    })
  })
})
