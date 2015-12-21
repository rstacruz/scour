'use strict'

const assign = require('object-assign')
const sift = require('sift')
const each = require('./lib/each')
const define = require('./lib/define_property')

/*
 * Returns a scour instance.
 *
 *    scour(obj)
 *    scour(obj, { root })
 *
 * Has the following properties:
 *
 *    s = scour(obj)
 *    s.root             // => scour
 *    s.keypath          // => array (string)
 */

function Scour (data, options) {
  if (!(this instanceof Scour)) return new Scour(data, options)
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

Scour.prototype = {
  /**
   * Returns data. If the given data is an object, it returns a scour instance.
   * Otherwise, it returns the data itself.
   */

  get () {
    var result = this.data
    var keypath = [].slice.apply(arguments).map((k) => '' + k)

    keypath.forEach((spec) => {
      if (result) result = result[spec]
    })

    return this._get(result, keypath)
  },

  /**
   * (Internal)
   */

  _get (result, keypath) {
    if (typeof result === 'object') {
      return new Scour(result, {
        root: this.root,
        keypath: this.keypath.concat(keypath)
      })
    } else {
      return result
    }
  },

  /**
   * Returns the item at `index`. This differs from `get` as this searches by
   * index.
   */

  at (index) {
    const key = this.keys()[index]
    return this._get(this.data[key], [ key ])
  },

  /**
   * Sets data
   */

  set (keypath, value) {
    // TODO
  },

  /**
   * Returns a clone of the instance.
   */

  clone (options) {
    return new Scour(this.data, assign({
      root: this.root,
      keypath: this.keypath,
      extensions: this.extensions.concat(options && options.extensions || [])
    }, options || {}))
  },

  /**
   * Loops
   */

  each (fn) {
    each(this.data, fn)
    return this
  },

  map (fn) {
    let result = []
    each(this.data, (val, key) => {
      result.push(fn(val, key))
    })
    return result
  },

  /**
   * Returns the length
   */

  len () {
    if (Array.isArray(this.data)) return this.data.length
    return this.keys().length
  },

  /**
   * Returns an array. If the data is an object, it returns the values.
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
   * Returns keys.
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
   */

  extend (props) {
    return this.clone({ extensions: [props] })
  }
}

module.exports = Scour
