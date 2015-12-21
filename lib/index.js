/* eslint-disable new-cap */
'use strict'

const sift = require('sift')
const each = require('./each')
const define = require('./define_property')
const collections = require('./collections')

/**
 * scour : scour(object)
 * Returns a scour instance wrapping `object`.
 *
 *    scour(obj)
 *
 * Has the following properties:
 *
 *    s = scour(obj)
 *    s.root             // => [scour object]
 *    s.value            // => raw data (that is, `obj`)
 *    s.keypath          // => string array
 *
 * You can access the raw data using `.value`.
 *
 *    db = scour(data)
 *    db.value              // => same as `data`
 *    db.go('users').value   // => same as `data.users`
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

function scour (value, options) {
  if (!(this instanceof scour)) return new scour(value, options)
  this.value = value
  define(this, 'root', options && options.root || this)
  define(this, 'keypath', options && options.keypath || [])
  define(this, 'extensions', options && options.extensions || [])

  this.extensions.forEach((ext) => {
    each(ext, (val, key) => {
      this[key] = val
    })
  })
}

/**
 * Attributes:
 * (Section) These attributes are available to [scour] instances.
 */

/**
 * root : root
 * A reference to the root [scour] instance.
 * Everytime you traverse using [go()], a new [scour] object is spawned that's
 * scoped to a keypath.  Each of these [scour] objects have a `root` attribute
 * that's a reference to the top-level [scour] object.
 *
 *     data = scour(...)
 *
 *     photos = data.go('photos')
 *     photos.root    // => same as `data`
 *
 * This allows you to return to the root when needed.
 *
 *     artist = scour(...).go('artists', '9328')
 *     artist.root.go('albums').find({ artist_id: artist.get('id') })
 */

/**
 * keypath : keypath
 * An array of strings representing each step in how deep the current scope is
 * relative to the root. Each time you traverse using [go()], a new [scour]
 * object is spawned.
 *
 *     data = scour(...)
 *
 *     users = data.go('users')
 *     users.keypath            // => ['users']
 *
 *     admins = users.go('admins')
 *     admins.keypath           // => ['users', 'admins']
 *
 *     user = admins.go('23')
 *     user.keypath             // => ['users', 'admins', '23']
 */

/**
 * value : value
 * The raw value being wrapped.
 */

scour.prototype = {
  /**
   * Traversal methods:
   * (Section) For traversing.
   */

  /**
   * Navigates down to a given `keypath`. Always returns a [scour] instance.
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
   * returned as a [scour] instance. This is not likely what you want; use
   * [get()] instead.
   *
   *     attr = scour(data).go('users', '12', 'name')
   *     attr           // => [scour object]
   *     attr.value     // => 'steve'
   *     attr.keypath   // => ['users', '12', 'name']
   */

  go (keypath) {
    keypath = [].slice.apply(arguments).map((k) => '' + k)
    const result = this.get.apply(this, keypath)
    return this._get(result, keypath, true)
  },

  /**
   * Returns the item at `index`. This differs from `go` as this searches by
   * index, not by key.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     scour(users).at(0)          // => [scour { name: 'steve' }]
   *     scour(users).get(12)        // => [scour { name: 'steve' }]
   */

  at (index) {
    const key = this.keys()[index]
    return this._get(this.value[key], [ key ])
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
    const results = sift(conditions, this.value)
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
    const key = sift.keyOf(conditions, this.value)
    if (typeof key === 'undefined') return
    return this._get(this.value[key], [key])
  },

  /**
   * Reading methods:
   * (Section) for retrieving data.
   */

  /**
   * Returns data in a given `keypath`.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve' },
   *           23: { name: 'bill' } } }
   *
   *     scour(data).get('users')       // => same as data.users
   *     scour(data).go('users').value  // => same as data.users
   */

  get (keypath) {
    var result = this.value
    keypath = [].slice.apply(arguments)

    for (let i = 0, len = arguments.length; i < len; i++) {
      result = result[arguments[i]]
      if (!result) return
    }

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
    if (Array.isArray(this.value)) return this.value.length
    return this.keys().length
  },

  /**
   * Returns an array. If the the value is an object, it returns the values of
   * that object.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).toArray()
   *     // => [ {name: 'steve'}, {name: 'bill'} ]
   */

  toArray () {
    if (Array.isArray(this.value)) return this.value
    return this.map((val) => val)
  },

  /**
   * Alias for `toArray()`.
   */

  values () {
    return this.toArray()
  },

  /**
   * Returns keys. If the value is an array, this returns the array's indices.
   */

  keys () {
    return Object.keys(this.value)
  },

  /**
   * Writing methods:
   * (Section) for writing data.
   */

  /**
   * Sets values. (To be implemented)
   */

  set (keypath, value) {
    if (!Array.isArray(keypath)) keypath = [keypath]

    if (this.root !== this) {
      return this.root.set(this.keypath.concat(keypath), value)
    }

    // TODO
  },

  /**
   * Utilities:
   * (Section) For stuff.
   */

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
    return this.spawn(this.value, { extensions: [props] })
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
    return this.value
  },

  toString () {
    return `[scour (${this.keys().join(', ')})]`
  },

  /**
   * Iteration methods:
   * (Section) For traversing.
   */

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
   * - `item` - the value; always a scour object.
   * - `key` - the key.
   *
   * The value being passed onto the function is going to be a `scour` object.
   * Use `item.value` or `this` to access the raw values.
   */

  forEach (fn) {
    each(this.value, (val, key) => {
      fn.call(val, this._get(val, [key]), key)
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
   * map : map(fn)
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

  map: collections.map,

  /**
   * Internal: spawns an instance with a given data and keypath.
   */

  _get (result, keypath) {
    if (typeof result === 'undefined' || result === null) return result
    return this.spawn(result, {
      keypath: this.keypath.concat(keypath)
    })
  },

  /**
   * Internal: Returns a clone of the instance extended with the given `value`
   * and `options`.
   */

  spawn (value, options) {
    return new scour(value || this.value, {
      root: options && options.root || this.root,
      keypath: options && options.keypath || this.keypath,
      extensions: this.extensions.concat(options && options.extensions || [])
    })
  }
}

module.exports = scour
