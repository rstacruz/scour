'use strict'

const test = require('tape')
const del = require('../../utilities/del')

test('scour.del()', (t) => {
  var data, result

  data = { users: { bob: { name: 'robert' } } }
  result = del(data, ['users', 'bob', 'name'])
  t.deepEqual(result, { users: { bob: { } } })

  data = { users: {} }
  result = del(data, ['users', 'bob', 'name'], 'john')
  t.deepEqual(result, { users: {} }, 'for deep structures')

  t.end()
})
