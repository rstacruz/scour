'use strict'

const test = require('tape')
const scour = require('../../scour')

var data, result

test('.filter() (simple)', (t) => {
  data = { a: 10, b: 11, c: 12, d: 13 }
  result = scour(data).filter((item) => item.value % 2 === 0)
  t.deepEqual(
    result.value,
    { a: 10, c: 12 },
    'works')

  data = { a: { num: 10 }, b: { num: 11 }, c: { num: 12 } }
  result = scour(data).filter({ num: 11 })
  t.deepEqual(
    result.value,
    { b: { num: 11 } },
    'works for objects/objects')

  data = { a: { num: 10 }, b: { num: 11 }, c: { num: 12 } }
  result = scour(data).filter({ num: { $eq: 11 } })
  t.deepEqual(
    result.value, { b: { num: 11 } },
    'works for objects/queries')

  t.end()
})
