'use strict'

const test = require('tape')
const cloneWithout = require('../../utilities/clone_without')

test('scour.cloneWithout()', (t) => {
  var input

  input = [ 'Moe', 'Larry', 'Curly' ]
  t.deepEqual(
    cloneWithout(input, 0), ['Larry', 'Curly'], 'for arrays')

  input = { moe: 1, larry: 2, curly: 3 }
  t.deepEqual(
    cloneWithout(input, 'larry'), { moe: 1, curly: 3 }, 'for objects')

  input = { moe: 1, larry: 2, curly: 3 }
  Object.defineProperty(input, 'sue', { enumerable: false, value: 4 })
  t.deepEqual(
    cloneWithout(input, 'larry'), { moe: 1, curly: 3 },
    'for objects with non-enumerables')

  t.end()
})
