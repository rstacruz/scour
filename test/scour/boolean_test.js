'use strict'

const scour = require('../../scour')

describe('boolean', function () {
  it('.get() works for true', function () {
    const data = { show: true }
    expect(scour(data).get('show')).toEqual(true)
  })

  it('.get() works for false', function () {
    const data = { show: false }
    expect(scour(data).get('show')).toEqual(false)
  })
})
