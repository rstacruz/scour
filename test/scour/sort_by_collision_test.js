'use strict'

const test = require('tape')
const scour = require('../../src/scour')

const object =
  { wilma: { name: 'Wilma' },
    barney1: { name: 'Barney' },
    barney2: { name: 'Barney' },
    fred: { name: 'Fred' } }

const sortedObject =
  { barney1: { name: 'Barney' },
    barney2: { name: 'Barney' },
    fred: { name: 'Fred' },
    wilma: { name: 'Wilma' } }

const list =
  [ { name: 'Wilma' },
    { name: 'Barney', id: 1 },
    { name: 'Barney', id: 2 },
    { name: 'Fred' } ]

const sortedList =
  [ { name: 'Barney', id: 1 },
    { name: 'Barney', id: 2 },
    { name: 'Fred' },
    { name: 'Wilma' } ]

test('.sortBy()', (t) => {
  t.deepEqual(
    scour(list).sortBy((item) => item.get('name')).value,
    sortedList,
    'for objects via function')

  t.deepEqual(
    scour(object).sortBy((item) => item.get('name')).value,
    sortedObject,
    'for arrays via function')

  t.deepEqual(
    scour(list).sortBy('name').value,
    sortedList,
    'for arrays via string')

  t.deepEqual(
    scour(object).sortBy('name').value,
    sortedObject,
    'for objects via string')

  t.end()
})
