'use strict'

const test = require('tape')
const scour = require('../../src')
const Search = require('scour-search')

const data = {
  users: [
    { name: 'john' },
    { name: 'jake' },
    { name: 'ara' }
  ]
}

test('indexing arrays', (t) => {
  const db = scour(data)
  const idb = db.index('users', 'name')

  t.deepEqual(
    idb.indices.users.filter({ name: 'john' }),
    [ { name: 'john' } ],
    'has scour-search indices')

  t.deepEqual(db.indices, undefined,
    'doesnt have scour-search indices by default')

  t.end()
})

test('indexing arrays: multiple indices', (t) => {
  const data = {
    users: [
      { name: 'john', gender: 'm' },
      { name: 'jake', gender: 'm' },
      { name: 'ara', gender: 'f' }
    ]
  }

  const db = scour(data)
    .index('users', 'name')
    .index('users', 'gender')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.indices.users.filter({ name: 'john' }),
      [ { name: 'john', gender: 'm' } ],
      'has scour-search indices')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: .filter unindexed', (t) => {
  const db = scour(data)

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')
    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [ { name: 'john' } ],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, true,
      'falls back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: .filter indexed', (t) => {
  const db = scour(data).index('users', 'name')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [ { name: 'john' } ],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: retaining indices', (t) => {
  let db = scour([]).index('users', 'name')

  t.ok(db.indices.users, 'has indices from the start')
  t.ok(db.go('a').indices.users, '.go() retains indices')
  t.ok(db.go('a').root === db, 'keeps root')
  t.ok(db.go('a').root.indices.users, '.go().root retains indices')
  t.end()
})

test('indexing arrays: .set', (t) => {
  let db = scour([]).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.set('users', data.users)
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [ { name: 'john' } ],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: .go.extend', (t) => {
  let db = scour([]).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.go('users').extend(data.users).root
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [ { name: 'john' } ],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: .extend root', (t) => {
  let db = scour([]).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.extend(data)
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [ { name: 'john' } ],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: .set deep', (t) => {
  let db = scour(data).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.set('users.4', { name: 'john' })
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [ { name: 'john' },
        { name: 'john' } ],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing arrays: .del', (t) => {
  let db = scour(data).index('users', 'name')
  db = db.del('users.0')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      [],
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

function sandbox (fn) {
  var sandbox = require('sinon').sandbox.create()
  try { fn(sandbox) }
  finally { sandbox.restore() }
}

// todo:
// x .index
// x .filter
// x .set
// x .del
// x .extend
//   .indexOf
//
// todo for scour-search:
//   indexing arrays nothing (data should not be undefined)
//   .reindex(data) all
