'use strict'

const test = require('tape')
const scour = require('../../scour')
const sortBy = require('../../utilities/sort_by')

const object =
  { wilma: { name: 'Wilma' },
    barney: { name: 'Barney' },
    fred: { name: 'Fred' } }

const sortedObject =
  { barney: { name: 'Barney' },
    fred: { name: 'Fred' },
    wilma: { name: 'Wilma' } }

const list =
  [ { name: 'Wilma' }, { name: 'Barney' }, { name: 'Fred' } ]

const sortedList =
  [ { name: 'Barney' }, { name: 'Fred' }, { name: 'Wilma' } ]

test('.sortBy() in scour-wrapping', (t) => {
  t.deepEqual(
    scour(list).sortBy((item) => item.get('name')).value,
    sortedList,
    'for arrays via funciton')

  t.deepEqual(
    scour(object).sortBy((item) => item.get('name')).value,
    sortedObject,
    'for objects via function')

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

test('.sortBy() in standalone', (t) => {
  t.deepEqual(
    sortBy(list, (item) => item.name),
    sortedList,
    'for arrays via function')

  t.deepEqual(
    sortBy(object, (item) => item.name),
    sortedObject,
    'for objects via function')

  t.deepEqual(
    sortBy(list, 'name'),
    sortedList,
    'for arrays via string')

  t.deepEqual(
    sortBy(object, 'name'),
    sortedObject,
    'for objects via string')

  t.end()
})
