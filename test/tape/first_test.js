'use strict'

const test = require('tape')
const scour = require('../../scour')

var data

test('.first()', (t) => {
  data = [ 'a', 'b' ]
  t.deepEqual(
    scour(data).first().value, 'a')

  data = { 0: 'a', 1: 'b' }
  t.deepEqual(
    scour(data).first().value, 'a',
    'works for objects')

  t.deepEqual(
    scour([]).first().value, undefined,
    'works for empty arrays')

  t.deepEqual(
    scour({}).first().value, undefined,
    'works for empty objects')

  t.end()
})
