'use strict'

const cloneWithout = require('../../utilities/clone_without')

describe('clone without', function () {
  it('works for arrays', function () {
    const data = [ 'Moe', 'Larry', 'Curly' ]
    expect(cloneWithout(data, 0)).toEqual(['Larry', 'Curly'])
  })

  it('works for objects', function () {
    const data = { moe: 1, larry: 2, curly: 3 }
    expect(cloneWithout(data, 'larry')).toEqual({ moe: 1, curly: 3 })
  })

  it('works for objects with non-enumerable properties', function () {
    const data = { moe: 1, larry: 2, curly: 3 }
    Object.defineProperty(data, 'sue', { enumerable: false, value: 4 })
    expect(cloneWithout(data, 'larry')).toEqual({ moe: 1, curly: 3 })
  })
})
