'use strict'

const test = require('tape')
const scour = require('../../scour')

test('.len()', (t) => {
  t.deepEqual(
    scour({ a: 1, b: 2 }).len(), 2,
    'works for objects')

  t.deepEqual(
    scour([ 'a', 'b' ]).len(), 2,
    'works for arrays')

  t.deepEqual(
    scour([]).len(), 0,
    'works for empties')

  t.deepEqual(
    scour(undefined).len(), 0,
    'works for undefined')

  t.end()
})
