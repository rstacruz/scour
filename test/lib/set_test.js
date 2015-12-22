'use strict'

const set = require('../../lib/set')

describe('set', function () {
  var data = { users: { bob: { name: 'robert' } } }

  it('works', function () {
    var result = set(data, ['users', 'bob', 'name'], 'john')

    expect(result).toEqual({ users: { bob: { name: 'john' } } })
  })
})
