'use strict'

const scour = require('../../scour')

describe('.set()', function () {
  it('works for root', function () {
    const data = { users: { bob: { name: 'robert' } } }
    const result = scour(data).set(['users', 'bob'], { id: 2 })

    expect(result.value).toEqual({ users: { bob: { id: 2 } } })
    expect(result.keypath).toEqual([])
  })

  it('allows dot notation', function () {
    const data = { bob: { name: 'Bob' } }
    const result = scour(data).set('bob.name', 'Robert')

    expect(result.value).toEqual({ bob: { name: 'Robert' } })
  })

  describe('for nonroot', function () {
    var data, root, users, result

    beforeEach(function () {
      data = { users: { bob: { name: 'robert' } } }
      root = scour(data)
      users = root.go('users')
      result = users.set(['matt'], { name: 'matthew' })
    })

    it('sets the correct values in root', function () {
      expect(result.root.value).toEqual(
        { users:
          { bob: { name: 'robert' },
            matt: { name: 'matthew' } } })
    })

    it('sets root keypath', function () {
      expect(result.root.keypath).toEqual([])
    })

    it('sets keypath', function () {
      expect(result.keypath).toEqual(['users'])
    })

    it('leaves old data unchanged', function () {
      expect(root.value).toEqual(
        { users: { bob: { name: 'robert' } } })
    })
  })

  it('works with wrapping', function () {
    const a = scour({ a: true })
    const b = scour({ b: true })

    const result = a.set('c', b)

    expect(result.value).toEqual({ a: true, c: { b: true } })
  })
})
