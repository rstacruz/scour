'use strict'

const test = require('tape')
const scour = require('../../src')

test('.last()', (t) => {
  t.deepEqual(scour([ 'a', 'b' ]).last().value, 'b', 'for arrays')
  t.deepEqual(scour({0: 'a', 1: 'b'}).last().value, 'b', 'for objects')
  t.deepEqual(scour([]).last().value, undefined, 'for empty arrays')
  t.deepEqual(scour({}).last().value, undefined, 'for empty objects')
  t.end()
})
