'use strict'

const test = require('tape')
const scour = require('../../src')

test('.del() works for root', (t) => {
  const data = { a: { b: 'foo' } }
  const result = scour(data).del([ 'a', 'b' ])

  t.deepEqual(result.value, { a: {} })
  t.deepEqual(result.keypath, [])
  t.end()
})

test('.del() allows dot notation', (t) => {
  const data = { a: { b: 'foo' } }
  const result = scour(data).del('a.b')

  t.deepEqual(result.value, { a: {} })
  t.deepEqual(result.keypath, [])
  t.end()
})

test('.del() leaves stuff behind', (t) => {
  const data = { a: { b: 'foo', c: 'bar' } }
  const result = scour(data).del('a.b')

  t.deepEqual(result.value, { a: { c: 'bar' } })
  t.deepEqual(result.keypath, [])
  t.end()
})

test('.del() for non-root', (t) => {
  var data = { a: { b: { c: 'd' } } }
  var root = scour(data)
  var a = root.go('a')
  var result = a.del('b')

  t.deepEqual(result.value, {})
  t.deepEqual(result.root.value, { a: {} }, 'sets a new root')
  t.end()
})
