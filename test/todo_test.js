'use strict'

describe('todo', function () {
  describe('v0.3', function () {
    it('most things', done)
    it('.set', done)
    it('.del', done)
    it('.extend', done)
    it('extensions', done)
    it('.sortBy', done)
    it('.get() no args', done)
    it('dot notation', done)
    it('always return scour objects', done)
  })

  describe('optimizations', function () {
    it('use native .forEach', done)
    it('optimize .sortBy(string)', done)
  })

  describe('array', function () {
    it('.at', done)
    it('.go and .at returning objects, ALWAYS', done)
    it('.getAt', done)
    it('.gather')
    it('.slice')
    it('.initial')
    it('.first', done)
    it('.last', done)
  })

  describe('collections', function () {
    it('.reject', done)
    it('.pluck')
    it('.reduce / .reduceRight')
    it('.every / .all')
    it('.some / .any')
    it('.contains / .includes')
  })
})

function done () {}
