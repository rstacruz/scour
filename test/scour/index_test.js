'use strict'

const test = require('tape')
const scour = require('../../src')
const Search = require('scour-search')
const sandbox = require('sinon-in-sandbox')

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

  t.deepEqual(db.indices, undefined,
    'doesnt have scour-search indices by default')

  t.end()
})

test('indexing: multiple indices', (t) => {
  const data = {
    users: {
      1: { name: 'john', gender: 'm' },
      2: { name: 'jake', gender: 'm' },
      3: { name: 'ara', gender: 'f' }
    }
  }

  const db = scour(data)
    .index('users', 'name')
    .index('users', 'gender')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.indices.users.filter({ name: 'john' }),
      { 1: { name: 'john', gender: 'm' } },
      'has scour-search indices')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing: .filter unindexed', (t) => {
  const db = scour(data)

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')
    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      { 1: { name: 'john' } },
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, true,
      'falls back to filterFallback()')
  })

  t.end()
})

test('indexing: .filter indexed', (t) => {
  const db = scour(data).index('users', 'name')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      { 1: { name: 'john' } },
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing: retaining indices', (t) => {
  let db = scour({}).index('users', 'name')

  t.ok(db.indices.users, 'has indices from the start')
  t.ok(db.go('a').indices.users, '.go() retains indices')
  t.ok(db.go('a').root === db, 'keeps root')
  t.ok(db.go('a').root.indices.users, '.go().root retains indices')
  t.end()
})

test('indexing: .set', (t) => {
  let db = scour({}).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.set('users', data.users)
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      { 1: { name: 'john' } },
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing: .go.extend', (t) => {
  let db = scour({}).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.go('users').extend(data.users).root
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      { 1: { name: 'john' } },
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing: .extend root', (t) => {
  let db = scour({}).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.extend(data)
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      { 1: { name: 'john' } },
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing: .set deep', (t) => {
  let db = scour(data).index('users', 'name')
  t.ok(db.indices.users, 'has indices')

  db = db.set('users.4', { name: 'john' })
  t.ok(db.indices.users, 'still has indices')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      { 1: { name: 'john' },
        4: { name: 'john' } },
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

test('indexing: .del', (t) => {
  let db = scour(data).index('users', 'name')
  db = db.del('users.1')

  sandbox((sinon) => {
    sinon.spy(Search.prototype, 'filterFallback')

    t.deepEqual(
      db.go('users').filter({ name: 'john' }).value,
      {},
      '.filter() works')

    t.equal(
      Search.prototype.filterFallback.called, false,
      'doesnt fall back to filterFallback()')
  })

  t.end()
})

// todo for scour-search:
//   indexing nothing (data should not be undefined)
//   .reindex(data) all
