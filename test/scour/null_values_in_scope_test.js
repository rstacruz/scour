'use strict'

const test = require('tape')
const scour = require('../../src/scour')

test('null values in scope', (t) => {
  const root = scour({})
  const nil = root.go('nonexistent')

  t.deepEqual(nil.len(), 0, 'len()')
  t.deepEqual(nil.get('foo'), undefined, 'get()')
  t.deepEqual(nil.getAt('foo'), undefined, 'getAt()')
  t.deepEqual(nil.at('foo').value, undefined, 'at()')
  t.deepEqual(nil.first().value, undefined, 'first()')
  t.deepEqual(nil.last().value, undefined, 'last()')
  t.deepEqual(nil.keys(), [], 'keys()')
  t.deepEqual(nil.go('foo').value, undefined, 'go().value')
  t.deepEqual(nil.sortBy('').value, [], 'sortBy()')
  t.deepEqual(nil.values(), [], 'sortBy()')
  t.deepEqual(nil.del('a').value, undefined, 'del()')

  t.doesNotThrow(() => nil.each((val, key) => {}), 'each()')
  t.doesNotThrow(() => nil.map((val, key) => {}), 'map()')
  t.doesNotThrow(() => nil.filter((val, key) => {}), 'filter()')
  t.doesNotThrow(() => nil.reject((val, key) => {}), 'reject()')

  t.deepEqual(
    nil.set('a', true).value,
    { a: true },
    'set()')

  t.deepEqual(
    nil.set('a', true).root.value,
    { nonexistent: { a: true } },
    'set()')

  t.end()
})
