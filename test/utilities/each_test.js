'use strict'

const test = require('tape')
const each = require('../../utilities/each')

test('scour.each() with arrays', (t) => {
  var values = ''
  each([7, 8, 9], (val) => { values += '.' + val })
  t.deepEqual(values, '.7.8.9', 'with arrays')
  t.end()
})

test('scour.each() with array keys', (t) => {
  var keys = ''
  each([9, 9, 9], function (_, key) { keys += '.' + key })
  t.deepEqual(keys, '.0.1.2', 'with array keys')
  t.end()
})

test('scour.each() with objects', (t) => {
  var values = ''
  each({ a: 8, b: 9 }, (val) => { values += '.' + val })
  t.deepEqual(values, '.8.9', 'with objects')
  t.end()
})

test('scour.each() with objects with non-enumerable properties', (t) => {
  var values = ''
  var input = { a: 8, b: 9 }
  Object.defineProperty(input, 'sue', { enumerable: false, value: 4 })
  t.deepEqual(input.sue, 4)

  each(input, (val) => { values += '.' + val })
  t.deepEqual(values, '.8.9', 'with non-enumerables')
  t.end()
})

test('scour.each() with object keys', (t) => {
  var keys = ''
  each({ a: 1, b: 2 }, function (_, key) { keys += '.' + key })
  t.deepEqual(keys, '.a.b')
  t.end()
})

test('scour.each() without native fallback', (t) => {
  delete each.native
  var values = ''
  each([7, 8, 9], (val) => { values += '.' + val })
  t.deepEqual(values, '.7.8.9')
  each.native = Array.prototype.forEach
  t.end()
})
