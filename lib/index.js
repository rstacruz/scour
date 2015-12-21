/* eslint-disable new-cap */
'use strict'

const sift = require('sift')
const each = require('./each')
const define = require('./define_property')
const collections = require('./collections')

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
 *    s.data             // => raw data (that is, `obj`)
 *    s.keypath          // => string array
 *
 * You can access the raw data using `.data`.
 *
 *    db = scour(data)
 *    db.data               // => same as `data`
 *    db.go('users').data   // => same as `data.users`
 *
 * When you traverse down using [go()](#go), `root` will point to the root
 * scour instance, and `keypath` will be updated accordingly.
 *
 *    db = scour(data)
 *    admins = db.go('users').go('admins')
 *
 *    admins.keypath  // => ['users', 'admins']
 *    admins.root     // => db
 */

function scour (data, options) {
  if (!(this instanceof scour)) return new scour(data, options)
  this.data = data
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
   * Navigates down to a given `keypath`. Always returns a `scour` instance.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve', last: 'jobs' },
   *           23: { name: 'bill', last: 'gates' } } }
   *
   *     scour(data).go('users')                    // => [scour (users)]
   *     scour(data).go('users', '12')              // => [scour (name, last)]
   *     scour(data).go('users', '12').get('name')  // => 'steve'
   *
   * If you use it on a non-object or non-array value, it will still be
   * returned as a scour instance. This is not likely what you want; use
   * [get()](#get) instead.
   *
   *     attr = scour(data).go('users', '12', 'name')
   *     attr           // => [scour object]
   *     attr.data      // => 'steve'
   *     attr.keypath   // => ['users', '12', 'name']
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

  _get (result, keypath) {
    if (typeof result === 'undefined' || result === null) return result
    return this.spawn(result, {
      keypath: this.keypath.concat(keypath)
    })
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
    if (!Array.isArray(keypath)) keypath = [keypath]

    if (this.root !== this) {
      return this.root.set(this.keypath.concat(keypath), value)
    }

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
   *
   * The values passed onto the function are:
   *
   * - `val` - the value; always a scour object.
   * - `key` - the key.
   *
   * The value being passed onto the function is going to be a `scour` object.
   * Use `val.data` to access the raw data.
   */

  forEach (fn) {
    each(this.data, (val, key) => {
      fn(this._get(val, [key]), key, val)
    })
    return this
  },

  /**
   * Alias for [forEach](#foreach).
   */

  each (fn) {
    return this.forEach(fn)
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
    return collections.map(this, fn)
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
  },

  /**
   * Returns the value for serialization. This allows `JSON.stringify()` to
   * work with `scour`-wrapped objects.
   *
   * The name of this method is a bit confusing, as it doesn't actually return
   * a JSON string — but I'm afraid that it's the way that the JavaScript API
   * for [JSON.stringify] works.
   *
   * [JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior
   */

  toJSON () {
    return this.data
  },

  toString () {
    return `[scour (${this.keys().join(', ')})]`
  }
}

module.exports = scour
