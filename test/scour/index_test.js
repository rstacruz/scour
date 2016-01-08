'use strict'

const test = require('tape')
const scour = require('../../src')
const Search = require('scour-search')

const data = {
  users: {
    1: { name: 'john' },
    2: { name: 'jake' },
    3: { name: 'ara' }
  }
}

test('indexing', (t) => {
  const db = scour(data)
  const idb = db.index('users', 'name')

  t.deepEqual(
    idb.indices.users.filter({ name: 'john' }),
    { 1: { name: 'john' } },
    'has scour-search indices')

  t.deepEqual(db.indices.users, undefined,
    'doesnt have scour-search indices by default')

  t.deepEqual(
    db.go('users').filter({ name: 'john' }).value,
    { 1: { name: 'john' } },
    'works with .filter (unindexed)')

  t.deepEqual(
    idb.go('users').filter({ name: 'john' }).value,
    { 1: { name: 'john' } },
    'works with .filter (indexed)')

  t.end()
})

// todo:
// x .index
// x .filter
//   .set
//   .extend
