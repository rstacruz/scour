'use strict'

const test = require('tape')
const scour = require('../../scour')

const list =
  [ { u: { name: 'Wilma' } },
    { u: { name: 'Barney' } },
    { u: { name: 'Fred' } } ]

const sortedList =
  [ { u: { name: 'Barney' } },
    { u: { name: 'Fred' } },
    { u: { name: 'Wilma' } } ]

test('.sortBy() dot notation', (t) => {
  t.deepEqual(
    scour(list).sortBy('u.name').value,
    sortedList)

  t.end()
})
