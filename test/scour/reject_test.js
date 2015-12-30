'use strict'

const test = require('tape')
const scour = require('../../scour')
var data, result

test('.reject()', (t) => {
  data = { a: 10, b: 11, c: 12, d: 13 }
  result = scour(data).reject((item) => item.value % 2 === 1)

  t.deepEqual(
    result.value, { a: 10, c: 12 },
    'works for objects/functions')

  data = { a: { num: 10 }, b: { num: 11 } }
  result = scour(data).reject({ num: 10 })

  t.deepEqual(
    result.value,
    { b: { num: 11 } },
    'works for objects/objects')

  data = { a: { num: 10 }, b: { num: 11 } }
  result = scour(data).reject({ num: { $eq: 11 } })

  t.deepEqual(
    result.value, { a: { num: 10 } },
    'works for objects/queries')

  t.end()
})
