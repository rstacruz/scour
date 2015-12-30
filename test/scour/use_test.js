'use strict'

const test = require('tape')
const scour = require('../../scour')

const data = { users: { 1: { name: 'john' } } }

function fullname () { return 'Mr. ' + this.get('name') }
function users () { return this.go('users') }

var user, db

test('.use()', (t) => {
  t.deepEqual(
    scour(data)
      .use({ 'users.*': { fullname } })
      .go('users', 1)
      .fullname(),
    'Mr. john',
    'users.*')

  t.deepEqual(
    scour(data)
      .use({ '': { users } })
      .users()
      .get('1.name'),
    'john',
    'root')

  t.deepEqual(
    scour(data)
      .use({ '**': { users } })
      .users()
      .get('1.name'),
    'john',
    '** on root')

  t.deepEqual(
    scour(data)
      .use({ '**': { fullname } })
      .go('users.1')
      .fullname(),
    'Mr. john',
    '** on non-root')

  t.deepEqual(
    scour(data)
      .use({ 'users.*': { fullname } })
      .go('users')
      .go(1)
      .fullname(),
    'Mr. john',
    'users.* (with multiple .go)')

  t.deepEqual(
    scour(data)
      .go('users')
      .use({ '*': { fullname } })
      .go(1)
      .fullname(),
    'Mr. john',
    '*')

  t.deepEqual(
    scour(data)
      .go('users')
      .use({ '*': { fullname } })
      .root
      .go('users').go(1)
      .fullname(),
    'Mr. john',
    'carries over to new root')

  t.deepEqual(
    scour(data)
      .use({ 'users.*': { fullname } })
      .use({ 'users.*': {
        greeting: function () {
          return `Hello, ${this.fullname()}`
        }
      } })
      .go('users', 1)
      .greeting(),
    'Hello, Mr. john',
    'stacks')

  t.end()
})
