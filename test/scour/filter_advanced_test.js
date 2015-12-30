'use strict'

const test = require('tape')
const scour = require('../../scour')

const data = {
  users: {
    1: { name: 'john' },
    2: { name: 'jake' },
    3: { name: 'ara' }
  }
}

test('.filter() advanced', (t) => {
  var result = scour(data).go('users').filter({ name: { $regex: /^j/ } })

  t.deepEqual(result.go(1).value, { name: 'john' })
  t.deepEqual(result.go(2).value, { name: 'jake' })
  t.deepEqual(result.go(3).value, undefined)
  t.end()
})

test('.filter() on objects', (t) => {
  var result = scour(data).go('users').filter({ name: { $regex: /^a/ } })

  t.deepEqual(result.go(3).value, { name: 'ara' }, 'indexes by id')
  t.deepEqual(result.go(3).keypath, [ 'users', '3' ], 'has keypaths')
  t.end()
})

test('.filter() with empty result', (t) => {
  t.deepEqual(
    scour(data).go('users').filter({ abc: 'def' }).len(),
    0)

  t.end()
})
