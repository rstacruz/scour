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

  describe('.get()', function () {
    it('works', function () {
      const users = scour(data).get('users')
      expect(users.data).toBeAn('object')
      expect(Object.keys(users.data)).toInclude('1')
      expect(Object.keys(users.data)).toInclude('2')
    })

    it('gives keypath', function () {
      expect(scour(data).get('users').keypath).toEqual(['users'])
    })

    it('gives keypath (multiple keys)', function () {
      expect(scour(data).get('users', '1').keypath)
      .toEqual(['users', '1'])
    })

    it('stringifies keypaths', function () {
      expect(scour(data).get('users', 1).keypath)
      .toEqual(['users', '1'])
    })

    it('gives keypath (recursive)', function () {
      expect(scour(data).get('users').get('1').keypath)
      .toEqual(['users', '1'])
    })

    it('returns scalars', function () {
      expect(scour(data).get('users', '1', 'name')).toEqual('john')
    })
  })

  describe('.at()', function () {
    it('works', function () {
      expect(scour(data).get('users').at(0).get('name'))
        .toEqual('john')
    })

    it('works for arrays', function () {
      expect(scour(list).at(0).get('name'))
        .toEqual('apple')
    })
  })

  describe('.root', function () {
    it('is accessible', function () {
      const root = scour(data)
      expect(root.get('users', 1).root).toEqual(root)
    })
  })

  describe('.extend()', function () {
    it('works', function () {
      let extension = {
        fullname () { return 'Mr. ' + this.get('name') }
      }

      let user = scour(data).get('users', 1)
        .extend(extension)

      expect(user.fullname()).toEqual('Mr. john')
    })
  })

  describe('.each()', function () {
    it('works', function () {
      const results = []

      scour(data).get('users').each((val, key) => {
        results.push([val, key])
      })

      expect(results[0]).toEqual([ { name: 'john' }, '1' ])
      expect(results[1]).toEqual([ { name: 'jake' }, '2' ])
    })
  })

  describe('.where()', function () {
    beforeEach(function () {
      this.results = scour(data).get('users').where({ name: { $regex: /^j/ } })
    })

    it('works', function () {
      expect(this.results.get(0).data).toEqual({ name: 'john' })
      expect(this.results.get(1).data).toEqual({ name: 'jake' })
      expect(this.results.get(2)).toEqual(undefined)
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

  describe('.where() empty', function () {
    beforeEach(function () {
      this.results = scour(data).get('users').where({ abc: 'def' })
    })

    it('works', function () {
      expect(this.results.len()).toEqual(0)
    })
  })

  describe('.map()', function () {
    it('works', function () {
      const results =
        scour(data).get('users').map((val, key) => {
          return [val, key]
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
      expect(this.root.get('0').data).toEqual({ name: 'apple' })
    })

    it('.get(...)', function () {
      expect(this.root.get('0', 'name')).toEqual('apple')
    })

    it('.data', function () {
      expect(this.root.data).toEqual(list)
    })

    it('.map()', function () {
      expect(this.root.map((f) => f.name)).toEqual(['apple', 'banana'])
    })
  })

  describe('edge cases: strings', function () {
    beforeEach(function () {
      this.root = scour('hey')
    })

    it('.get()', function () {
      expect(this.root.get('0')).toEqual('h')
    })

    it('.data', function () {
      expect(this.root.data).toEqual('hey')
    })

    it('.map()', function () {
      expect(this.root.map((n) => n)).toEqual(['h', 'e', 'y'])
    })
  })
})
