'use strict'

const set = require('../../utilities/set')

describe('set', function () {
  it('works', function () {
    var data = { users: { bob: { name: 'robert' } } }
    var result = set(data, ['users', 'bob', 'name'], 'john')

    expect(result).toEqual({ users: { bob: { name: 'john' } } })
  })

  it('creates deep structures', function () {
    var data = { users: 2 }
    var result = set(data, ['users', 'bob', 'name'], 'john')

    expect(result).toEqual({ users: { bob: { name: 'john' } } })
  })

  it('handles arrays', function () {
    var data = { users: [ 'item' ] }
    var result = set(data, ['users', '0', 'name'], 'john')

    expect(result).toEqual({ users: [
      { name: 'john' }
    ]})
  })

  it('handles arrays', function () {
    var data = { users: [ 'item' ] }
    var result = set(data, ['users', '1', 'name'], 'john')

    expect(result).toEqual({ users: [
      'item',
      { name: 'john' }
    ]})
  })

  it('handles string turning into objects', function () {
    var data = { users: [ '...' ] }
    var result = set(data, [ 'users', 0, 'name' ], 'john')

    expect(result).toEqual({ users: [ { name: 'john' } ] })
  })
})
