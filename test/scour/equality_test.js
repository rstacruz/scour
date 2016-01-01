'use strict'

const test = require('tape')
const scour = require('../../src')

const data =
  { users:
    { 1: { name: 'john' },
      2: { name: 'jake' },
      3: { name: 'ara' } } }

test('equality', (t) => {
  // t.ok(scour(data) === scour(data), 'equality check')
  t.ok(scour(data).equal(scour(data)), '.equal')
  t.ok(scour(data).go('users').root.equal(scour(data)), 'with .go().root')
  t.ok(scour(data).go('users').equal(scour(data).go('users')), 'with .go')
  t.ok(scour(data).go('users').go('1').equal(scour(data).go('users.1')), 'with nested .go')
  t.end()
})
