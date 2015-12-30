'use strict'

const test = require('tape')
const scour = require('../../src')

test('.forEach() arrays', (t) => {
  const data = [ { apple: true }, { banana: true } ]
  const result = []

  scour(data).forEach((item, key, idx) =>
    result.push({ item, key, idx }))

  t.deepEqual(result[0].item.value, { apple: true })
  t.deepEqual(result[0].key, 0)
  t.deepEqual(result[0].idx, 0)

  t.deepEqual(result[1].item.value, { banana: true })
  t.deepEqual(result[1].key, 1)
  t.deepEqual(result[1].idx, 1)
  t.end()
})

test('.forEach() objects', (t) => {
  const data = { a: { apple: true }, b: { banana: true } }
  const result = []

  scour(data).forEach((item, key, idx) =>
    result.push({ item, key, idx }))

  t.deepEqual(result[0].item.value, { apple: true })
  t.deepEqual(result[0].key, 'a')
  t.deepEqual(result[0].idx, 0)

  t.deepEqual(result[1].item.value, { banana: true })
  t.deepEqual(result[1].key, 'b')
  t.deepEqual(result[1].idx, 1)
  t.end()
})
