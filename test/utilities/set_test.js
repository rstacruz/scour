'use strict'

const test = require('tape')
const set = require('../../utilities/set')

test('scour.set()', (t) => {
  var data, result

  data = { users: { bob: { name: 'robert' } } }
  result = set(data, ['users', 'bob', 'name'], 'john')

  t.deepEqual(
    result, { users: { bob: { name: 'john' } } },
    'works')

  data = { users: 2 }
  result = set(data, ['users', 'bob', 'name'], 'john')

  t.deepEqual(
    result, { users: { bob: { name: 'john' } } },
    'creates deep structures')

  data = { users: [ 'item' ] }
  result = set(data, ['users', '0', 'name'], 'john')

  t.deepEqual(
    result, { users: [ { name: 'john' } ]},
    'handles arrays')

  data = { users: [ 'item' ] }
  result = set(data, ['users', '1', 'name'], 'john')

  t.deepEqual(
    result, { users: [ 'item', { name: 'john' } ]},
    'handles pushing to arrays')

  data = { users: [ '...' ] }
  result = set(data, [ 'users', 0, 'name' ], 'john')

  t.deepEqual(
    result, { users: [ { name: 'john' } ] },
    'string turning into objects')

  t.end()
})
