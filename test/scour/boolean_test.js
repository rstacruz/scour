'use strict'

const test = require('tape')
const scour = require('../../scour')

test('boolean', (t) => {
  t.deepEqual(
    scour({ show: true }).get('show'),
    true)

  t.deepEqual(
    scour({ show: false }).get('show'),
    false)

  t.end()
})
