'use strict'

var test = require('tape')
var scour = require('../../src')

const data = {
  users: {
    1: { name: 'john' },
    2: { name: 'jake' },
    3: { name: 'ara' }
  }
}

const list = [
  { name: 'apple' },
  { name: 'banana' }
]

test('.go()', (t) => {
  const users = scour(data).go('users')

  t.equal(
    typeof users.value, 'object',
    'should be an object')

  t.ok(
    Object.keys(users.value).indexOf('1') > -1,
    'includes 1')

  t.ok(
    Object.keys(users.value).indexOf('2') > -1,
    'includes 2')

  t.end()
})

test('.go()', (t) => {
  t.deepEqual(
    scour(data).go('users').keypath,
    ['users'],
    'sets keypath')

  t.deepEqual(
    scour(data).go('users.1').keypath,
    ['users', '1'],
    'allows dot notation')

  t.deepEqual(
    scour(data).go(['users', '1']).keypath,
    ['users', '1'],
    'allows arrays')

  t.deepEqual(
    scour(data).go('users.1').keypath,
    ['users', '1'],
    'allows dot notation')

  t.deepEqual(
    scour(data).go(['users', '1']).keypath,
    ['users', '1'],
    'allows arrays')

  t.deepEqual(
    scour(data).go(['users', 1]).keypath,
    ['users', '1'],
    'allows arrays with numbers')

  t.deepEqual(
    scour(data).go('users', '1').keypath,
    ['users', '1'],
    'gives keypath (multiple keys)')

  t.deepEqual(
    scour(data).go('users', 1).keypath,
    ['users', '1'],
    'stringifies keypaths')

  t.deepEqual(
    scour(data).go('users').go('1').keypath,
    ['users', '1'],
    'gives keypath (recursive)')

  t.deepEqual(
    scour(data).go('users', '1', 'name').value,
    'john',
    'allows traversing to strings')

  t.end()
})

test('.get()', (t) => {
  t.deepEqual(
    scour(data).get(),
    data,
    'allows calling .get() with nothing')

  t.end()
})
