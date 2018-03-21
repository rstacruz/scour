'use strict'

const test = require('tape')
const scour = require('../../src')

var data, result

test('.set() root', (t) => {
  var data = { users: { bob: { name: 'robert' } } }
  var result = scour(data).set(['users', 'bob'], { id: 2 })

  t.deepEqual(result.value, { users: { bob: { id: 2 } } })
  t.deepEqual(result.keypath, [])
  t.end()
})

test('.set() dot notation', (t) => {
  var data = { bob: { name: 'Bob' } }
  var result = scour(data).set('bob.name', 'Robert')

  t.deepEqual(
    result.value,
    { bob: { name: 'Robert' } })
  t.end()
})

test('.set()', (t) => {
  t.deepEqual(
    scour({ }).go('bob').set('name', 'Robert').root.value,
    { bob: { name: 'Robert' } },
    'allow .go().set()')

  t.deepEqual(
    scour({}).set(['ui', '1.2', 'loaded'], true).value,
    { ui: { '1.2': { loaded: true } } },
    'allow dotted paths in an array')

  t.end()
})

test('.set() for nonroot', (t) => {
  var data = { users: { bob: { name: 'robert' } } }
  var root = scour(data)
  var users = root.go('users')
  var result = users.set(['matt'], { name: 'matthew' })

  t.deepEqual(
    result.root.value, 
    { users:
      { bob: { name: 'robert' },
        matt: { name: 'matthew' } } },
    'sets correct values in root')

  t.deepEqual(
    result.root.keypath, [], 'sets root keypath') 
  t.deepEqual(
    result.keypath, ['users'], 'sets keypath')
  t.deepEqual(
    root.value, { users: { bob: { name: 'robert' } } },
    'leaves old values unchanged')

  t.end()
})

test('.set() with wrapping', (t) => {
  var a = scour({ a: true })
  var b = scour({ b: true })

  t.deepEqual(
    a.set('c', b).value,
    { a: true, c: { b: true } })

  t.end()
})

test('.set() null', (t) => {
  var data = { bob: { name: 'Bob' } }
  var result = scour(data).set('bob.name', null)

  t.deepEqual(
    result.value,
    { bob: { name: null } })
  t.end()
})
