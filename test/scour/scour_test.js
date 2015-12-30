'use strict'

const test = require('tape')
var scour = require('../../src')

const data =
  { users:
    { 1: { name: 'john' },
      2: { name: 'jake' },
      3: { name: 'ara' } } }

const list =
  [ { name: 'apple' },
    { name: 'banana' } ]

test('.toString()', (t) => {
  t.equal(
    typeof scour({ a: 1 }).toString(), 'string')
  t.end()
})

test('.root', (t) => {
  const root = scour(data)
  t.equal(root.go('users', 1).root, root)
  t.end()
})

test('.each()', (t) => {
  const results = []

  scour(data).go('users').each((val, key) => {
    results.push([ val.value, key ])
  })

  t.deepEqual(results[0], [ { name: 'john' }, '1' ])
  t.deepEqual(results[1], [ { name: 'jake' }, '2' ])
  t.end()
})


test('.len()', (t) => {
  t.deepEqual(
    scour({ a: 1, b: 2 }).len(), 2,
    'for objects')

  t.deepEqual(
    scour([ 1, 2 ]).len(), 2,
    'for arrays')

  t.deepEqual(
    scour(undefined).len(), 0,
    'for undefined')

  t.end()
})

test('.find() empty', (t) => {
  t.deepEqual(
    scour(data).go('users').find({ abc: 'def' }),
    undefined)
  t.end()
})

test('.map()', (t) => {
  const results =
    scour(data).go('users').map((val, key) => {
      return [val.value, key]
    })

  t.deepEqual(results[0], [ { name: 'john' }, '1' ])
  t.deepEqual(results[1], [ { name: 'jake' }, '2' ])
  t.end()
})

test('arrays', (t) => {
  root = scour(list)

  t.deepEqual(root.go('0').value, { name: 'apple' }, '.go().value')
  t.deepEqual(root.get('0', 'name'), 'apple', '.get(...)')
  t.deepEqual(root.value, list, '.value')
  t.deepEqual(root.map((f) => f.get('name')), ['apple', 'banana'], '.map')
  t.end()
})

test('edge cases: strings', (t) => {
  root = scour('hey')

  t.deepEqual(root.get('0'), 'h', '.get()')
  t.deepEqual(root.value, 'hey', '.value()')
  t.deepEqual(root.map((n) => n.value), ['h', 'e', 'y'], '.map()')
  t.end()
})

test('.toJSON()', (t) => {
  t.deepEqual(
    JSON.stringify(scour(data)),
    JSON.stringify(data))
  t.end()
})

test('.map() forscour.*', (t) => {
  const input = { a: 10, b: 20, c: 30 }
  const output = scour.map(input, (val) => val / 10)
  t.deepEqual(output, [ 1, 2, 3 ])
  t.end()
})
