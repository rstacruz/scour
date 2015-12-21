'use strict'

var scour = require('../index')

describe('index', function () {
  const data = {
    users: {
      1: { name: 'john' },
      2: { name: 'jake' }
    }
  }

  describe('get', function () {
    it('works', function () {
      const users = scour(data).get('users')
      expect(users.data).toBeAn('object')
      expect(Object.keys(users.data)).toInclude('1')
      expect(Object.keys(users.data)).toInclude('2')
    })

    it('returns scalars', function () {
      expect(scour(data).get('users', '1', 'name')).toEqual('john')
    })
  })
})
