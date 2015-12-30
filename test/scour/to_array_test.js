'use strict'

var test = require('tape')
var scour = require('../../src')

const list = [
  { name: 'apple' },
  { name: 'banana' }
]

test('.toArray()', (t) => {
  t.deepEqual(
    scour({ a: 1, b: 2 }).toArray(),
    [1, 2],
    'works with objects')

  t.deepEqual(
    scour({ a: 1, b: 2 }).values(),
    [ 1, 2 ],
    'works for objects with .values()')

  t.deepEqual(
    scour(list).toArray(),
    list,
    'works for arrays')

  t.deepEqual(
    scour('12').toArray(),
    [ '1', '2' ],
    'works for strings')

  t.deepEqual(
    scour(12).toArray(),
    [],
    'works for numbers')

  t.deepEqual(
    scour(undefined).toArray(),
    [],
    'works for undefined')

  t.deepEqual(
    scour(null).toArray(),
    [],
    'works for null')

  t.end()
})
