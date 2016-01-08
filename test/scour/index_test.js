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

test.skip('indexing: .del', (t) => { // TODO
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

function sandbox (fn) {
  var sandbox = require('sinon').sandbox.create()
  try { fn(sandbox) }
  finally { sandbox.restore() }
}

// todo:
// x .index
// x .filter
// x .set
//   .del
//   .extend
//   .indexOf
//
// todo for scour-search:
//   deletions (reindex({...}, [1])
//   indexing nothing (data should not be undefined)
