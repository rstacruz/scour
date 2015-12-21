/* eslint-disable new-cap */
'use strict'

const sift = require('sift')
const each = require('./lib/each')
const define = require('./lib/define_property')

/*
 * scour:
 * Returns a scour instance.
 *
 *    scour(obj)
 *
 * Has the following properties:
 *
 *    s = scour(obj)
 *    s.root             // => [scour object]
 *    s.keypath          // => array (string)
 */

function scour (data, options) {
  if (!(this instanceof scour)) return new scour(data, options)
  define(this, 'data', data)
  define(this, 'root', options && options.root || this)
  define(this, 'keypath', options && options.keypath || [])
  define(this, 'extensions', options && options.extensions || [])

  this.extensions.forEach((ext) => {
    each(ext, (val, key) => {
      this[key] = val
    })
  })
}

scour.prototype = {
  /**
   * Navigates down to a given `keypath`.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve' },
   *           23: { name: 'bill' } } }
   *
   *     scour(data).go('users')                    // => <scour instance>
   *     scour(data).go('users', '23').get('name')  // => 'steve'
   */

  go (keypath) {
    keypath = [].slice.apply(arguments).map((k) => '' + k)
    const result = this.get.apply(this, keypath)
    return this._get(result, keypath, true)
  },

  /**
   * Returns data in a given `keypath`.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve' },
   *           23: { name: 'bill' } } }
   *
   *     scour(data).get('users')       // => same as data.users
   *     scour(data).go('users').data   // => same as data.users
   */

  get (keypath) {
    var result = this.data
    keypath = [].slice.apply(arguments)

    for (let i = 0, len = arguments.length; i < len; i++) {
      result = result[arguments[i]]
      if (!result) return
    }

    return result
  },

  /**
   * (Internal)
   */

  _get (result, keypath, strict) {
    if (typeof result === 'object') {
      return this.spawn(result, {
        keypath: this.keypath.concat(keypath)
      })
    } else {
      // value in keypath is not an object
      if (strict && result) return
      return result
    }
  },

  /**
   * Returns the item at `index`. This differs from `get` as this searches by
   * index, not by key.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     scour(users).at(0)         // => { name: 'steve' }
   *     scour(users).get(12).data  // => { name: 'steve' }
   */

  at (index) {
    const key = this.keys()[index]
    return this._get(this.data[key], [ key ])
  },

  /**
   * Sets data. (To be implemented)
   */

  set (keypath, value) {
    // TODO
  },

  /**
   * (Internal) Returns a clone of the instance extended with the given `data`
   * and `options`.
   */

  spawn (data, options) {
    return new scour(data || this.data, {
      root: options && options.root || this.root,
      keypath: options && options.keypath || this.keypath,
      extensions: this.extensions.concat(options && options.extensions || [])
    })
  },

  /**
   * Loops through each item. Supports both arrays and objects.
   *
   * If the item found is an object, it will be returned as a `scour` instance.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     scour(users).each((user, key) => {
   *       console.log(user.get('name'))
   *     })
   */

  each (fn) {
    each(this.data, (val, key) => {
      fn(this._get(val, [key]), key, val)
    })
    return this
  },

  /**
   * Loops through each item and returns an array based on the iterator's
   * return values. Supports both arrays and objects.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).map((user, key) => user.get('name'))
   *     // => [ 'steve', 'bill' ]
   */

  map (fn) {
    const result = []
    this.each((val, key, raw) => { result.push(fn(val, key, raw)) })
    return result
  },

  /**
   * Returns the length of the object or array. For objects, it returns the
   * number of keys.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).len()  // => 2
   */

  len () {
    if (Array.isArray(this.data)) return this.data.length
    return this.keys().length
  },

  /**
   * Returns an array. If the data is an object, it returns the values.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).toArray()
   *     // => [ {name: 'steve'}, {name: 'bill'} ]
   */

  toArray () {
    if (Array.isArray(this.data)) return this.data
    return this.map((val) => val)
  },

  /**
   * Alias for `toArray()`.
   */

  values () {
    return this.toArray()
  },

  /**
   * Returns keys. If the data is an array, returns the array's indices.
   */

  keys () {
    return Object.keys(this.data)
  },

  /**
   * Sifts through the values and returns a set that matches given `conditions`.
   * Supports MongoDB-style queries.
   *
   * For reference, see [MongoDB Query Operators][query-ops].
   *
   * [query-ops]: https://docs.mongodb.org/manual/reference/operator/query/
   *
   *     scour(data).where({ name: 'john' })
   *     scour(data).where({ name: { $in: ['moe', 'larry'] })
   */

  where (conditions) {
    const results = sift(conditions, this.data)
    return this._get(results, [])
  },

  /**
   * Returns the first value that matches `conditions`.
   * Supports MongoDB-style queries.
   *
   * For reference, see [MongoDB Query Operators][query-ops].
   *
   * [query-ops]: https://docs.mongodb.org/manual/reference/operator/query/
   *
   *     scour(data).find({ name: 'john' })
   *     scour(data).find({ name: { $in: ['moe', 'larry'] })
   */

  find (conditions) {
    const key = sift.keyOf(conditions, this.data)
    if (typeof key === 'undefined') return
    return this._get(this.data[key], [key])
  },

  /**
   * Extends functionality with some prototype.
   *
   *     users =
   *       { 12: { name: 'steve', surname: 'jobs' },
   *         23: { name: 'bill', surname: 'gates' } }
   *
   *     methods = {
   *       fullname () {
   *         return this.get('name') + ' ' + this.get('surname')
   *       }
   *     }
   *
   *     scour(users)
   *       .get(12)
   *       .extend(methods)
   *       .fullname()       // => 'bill gates'
   */

  extend (props) {
    return this.spawn(this.data, { extensions: [props] })
  }
}

module.exports = scour
