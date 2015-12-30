'use strict'

const test = require('tape')
const scour = require('../../src/scour')
const shuffle = require('../support/shuffle')

test('.sortBy() (shuffled)', (t) => {
  const list = [ 8, 20, 23, 39, 58, 83, 95, 104, 294, 1005 ]
    .map((n) => ({ number: n }))

  for (var i = 0; i < 5; i++) {
    t.deepEqual(
      scour(shuffle(list)).sortBy('number').value,
      list,
      `should sort after shuffling (${i})`)
  }

  t.end()
})
