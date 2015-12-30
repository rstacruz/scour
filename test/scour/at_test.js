'use strict'

const test = require('tape')
const scour = require('../../scour')

const data =
  { users:
    { 1: { name: 'john' },
      2: { name: 'jake' },
      3: { name: 'ara' } } }

const list =
  [ { name: 'apple' },
    { name: 'banana' } ]

test('.at()', (t) => {
  t.deepEqual(
    scour(data).go('users').at(0).get('name'),
    'john',
    'works')

  t.equal(
    scour(data).go('users').at(999).value,
    undefined,
    'OOB on objects')

  t.equal(
    scour([]).at(999).value,
    undefined,
    'OOB on lists')

  t.equal(
    scour([ { name: 'apple' } ]).at(0).get('name'),
    'apple',
    'works for arrays')

  t.end()
})

test('.getAt()', (t) => {
  t.deepEqual(
    scour(data).go('users').getAt(0),
    { name: 'john' })

  t.deepEqual(scour(list).getAt(0),
    { name: 'apple' },
    'works for arrays')

  t.deepEqual(
    scour(data).go('users').getAt(99),
    undefined,
    'works for OOB (objects)')

  t.deepEqual(
    scour(list).getAt(99),
    undefined,
    'works for OOB (lists)')

  t.end()
})
