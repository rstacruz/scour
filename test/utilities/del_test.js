'use strict'

const del = require('../../utilities/del')

describe('del', function () {
  it('works', function () {
    var data = { users: { bob: { name: 'robert' } } }
    var result = del(data, ['users', 'bob', 'name'])

    expect(result).toEqual({ users: { bob: { } } })
  })

  it('works with deep structures', function () {
    var data = { users: {} }
    var result = del(data, ['users', 'bob', 'name'], 'john')

    expect(result).toEqual({ users: {} })
  })
})
