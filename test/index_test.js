'use strict'

var scour = require('../index')

describe('index', function () {
  const data = {
    users: {
      1: { name: 'john' },
      2: { name: 'jake' }
    }
  }

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

      expect(results).toEqual([
        [ { name: 'john' }, '1' ],
        [ { name: 'jake' }, '2' ]
      ])
    })
  })

  describe('.map()', function () {
    it('works', function () {
      const results =
        scour(data).get('users').map((val, key) => {
          return [val, key]
        })

      expect(results).toEqual([
        [ { name: 'john' }, '1' ],
        [ { name: 'jake' }, '2' ]
      ])
    })
  })
})
