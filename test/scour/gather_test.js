'use strict'

const test = require('tape')
const scour = require('../../src/scour')

test('.gather() for arrays', (t) => {
  const data = [
    { name: 'David' },
    { name: 'Matt' },
    { name: 'Peter' }
  ]

  const result = scour(data).gather([0, 1])

  t.deepEqual(result.len(), 2)
  t.deepEqual(result.at(0).value, { name: 'David' })
  t.end()
})

test('.gather() for objects', (t) => {
  const data = {
    10: { name: 'David' },
    11: { name: 'Matt' },
    12: { name: 'Peter' }
  }

  const result = scour(data).gather([ 10, 11 ])

  t.deepEqual(result.value, {
    10: { name: 'David' },
    11: { name: 'Matt' }
  })

  t.deepEqual(result.len(), 2)
  t.deepEqual(result.at(0).value, { name: 'David' })
  t.deepEqual(result.get(10), { name: 'David' })
  t.end()
})
