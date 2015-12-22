/* eslint-disable new-cap */
'use strict'

const sift = require('sift')
const assign = require('object-assign')
const buildExtensions = require('./lib/build_extensions')
const normalizeKeypath = require('./lib/normalize_keypath')

/**
 * scour : scour(object)
 * Returns a scour instance wrapping `object`.
 *
 *    scour(obj)
 *
 * It can be called on any Object or Array. (In fact, it can be called on
 * anything, but is only generally useful for Objects and Arrays.)
 *
 *     data = { menu: { visible: true, position: 'left' } }
 *     scour(data).get('menu.visible')
 *
 *     list = [ { id: 2 }, { id: 5 }, { id: 12 } ]
 *     scour(list).get('0.id')
 *
 * __Chaining__:
 * You can use it to start method chains. In fact, the intended use is to keep
 * your root [scour] object around, and chain from this.
 *
 *     db = scour({ menu: { visible: true, position: 'left' } })
 *
 *     // Elsewhere:
 *     menu = db.go('menu')
 *     menu.get('visible')
 *
 * __Properties__:
 * It the [root], [value] and [keypath] properties.
 *
 *    s = scour(obj)
 *    s.root             // => [scour object]
 *    s.value            // => raw data (that is, `obj`)
 *    s.keypath          // => string array
 *
 * __Accessing the value:__
 * You can access the raw data using [value].
 *
 *    db = scour(data)
 *    db.value               // => same as `data`
 *    db.go('users').value   // => same as `data.users`
 */

function scour (value, options) {
  if (!(this instanceof scour)) return new scour(value, options)
  this.value = value

  this.root = options && options.root || this
  this.keypath = options && options.keypath || []
  this.extensions = options && options.extensions || []

  // Apply any property extensions
  if (this.extensions.length) this.applyExtensions()
}

/**
 * Attributes:
 * (Section) These attributes are available to [scour] instances.
 */

/**
 * value : value
 * The raw value being wrapped. You can use this to terminate a chained call.
 *
 *     users =
 *       [ { name: 'john', admin: true },
 *         { name: 'kyle', admin: false } ]
 *
 *     scour(users)
 *       .filter({ admin: true })
 *       .value
 *     // => [ { name: 'john', admin: true } ]
 */

/**
 * root : root
 * A reference to the root [scour] instance.
 * Everytime you traverse using [go()], a new [scour] object is spawned that's
 * scoped to a keypath.  Each of these [scour] objects have a `root` attribute
 * that's a reference to the top-level [scour] object.
 *
 *     db = scour(...)
 *
 *     photos = db.go('photos')
 *     photos.root    // => same as `db`
 *
 * This allows you to return to the root when needed.
 *
 *     db = scour(...)
 *     artist = db.go('artists', '9328')
 *     artist.root.go('albums').find({ artist_id: artist.get('id') })
 */

/**
 * keypath : keypath
 * An array of strings representing each step in how deep the current scope is
 * relative to the root. Each time you traverse using [go()], a new [scour]
 * object is spawned.
 *
 *     db = scour(...)
 *
 *     users = db.go('users')
 *     users.keypath            // => ['users']
 *
 *     admins = users.go('admins')
 *     admins.keypath           // => ['users', 'admins']
 *
 *     user = admins.go('23')
 *     user.keypath             // => ['users', 'admins', '23']
 */

scour.prototype = {
  /**
   * Traversal methods:
   * (Section) For traversing. All these methods return [scour] instances,
   * making them suitable for chaining.
   */

  /**
   * go : go(keypath...)
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
   * __Dot notation:__
   * Keypaths can be given in dot notation or as an array. These statements are
   * equivalent.
   *
   *     scour(data).go('users.12')
   *     scour(data).go('users', '12')
   *     scour(data).go(['users', '12'])
   *
   * __Non-objects:__
   * If you use it on a non-object or non-array value, it will still be
   * returned as a [scour] instance. This is not likely what you want; use
   * [get()] instead.
   *
   *     attr = scour(data).go('users', '12', 'name')
   *     attr           // => [scour object]
   *     attr.value     // => 'steve'
   *     attr.keypath   // => ['users', '12', 'name']
   */

  go () {
    const keypath = normalizeKeypath(arguments, true)
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
    if (Array.isArray(this.value)) {
      return this._get(this.value[index], [ '' + index ])
    }

    const key = this.keys()[index]
    return this._get(this.value[key], [ '' + key ])
  },

  /**
   * Sifts through the values and returns a set that matches given
   * `conditions`. Supports functions, simple objects, and MongoDB-style
   * queries.
   *
   * [query-ops]: https://docs.mongodb.org/manual/reference/operator/query/
   *
   *     scour(data).filter({ name: 'john' })
   *     scour(data).filter({ name: { $in: ['moe', 'larry'] })
   *
   * MongoDB-style queries are supported as provided by [sift.js].  For
   * reference, see [MongoDB Query Operators][query-ops].
   *
   *     scour(products).filter({ price: { $gt: 200 })
   *     scour(articles).filter({ published_at: { $not: null }})
   */

  filter (conditions) {
    const results = sift(conditions, this.value)
    return this._get(results, [])
  },

  /**
   * Returns the first value that matches `conditions`.  Supports MongoDB-style
   * queries. For reference, see [MongoDB Query Operators][query-ops]. Also
   * see [filter()], as this is functionally-equivalent to the first result of
   * `filter()`.
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
   * Returns the first result as a [scour]-wrapped object. This is equivalent
   * to [at(0)](#at).
   */

  first () {
    return this.at(0)
  },

  /**
   * Returns the first result as a [scour]-wrapped object. This is equivalent
   * to `at(len() - 1)`: see [at()] and [len()].
   */

  last () {
    return this.at(this.len() - 1)
  },

  /**
   * Reading methods:
   * (Section) For retrieving data.
   */

  /**
   * get : get(keypath...)
   * Returns data in a given `keypath`.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve' },
   *           23: { name: 'bill' } } }
   *
   *     scour(data).get('users')       // => same as data.users
   *     scour(data).go('users').value  // => same as data.users
   *
   * __Dot notation:__
   * Like [go()], the `keypath` can be given in dot notation.
   *
   *     scour(data).get('books.featured.name')
   *     scour(data).get('books', 'featured', 'name')
   */

  get () {
    let result = this.value
    const keypath = normalizeKeypath(arguments, true)

    for (let i = 0, len = keypath.length; i < len; i++) {
      result = result[keypath[i]]
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
    if (!this.value) return 0
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
    var result = []
    scour.each(this.value, (val, key) => result.push(val))
    return result
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
   * (Section) These are methods for modifying an object/array tree immutably.
   * Note that all these functions are immutable--it will not modify existing
   * data, but rather spawn new objects with the modifications done on them.
   */

  /**
   * Sets values immutably. Returns a copy of the same object ([scour]-wrapped)
   * with the modifications applied.
   *
   *     data = { bob: { name: 'Bob' } }
   *     db = scour(data)
   *     db.set([ 'bob', 'name' ], 'Robert')
   *     // db.value == { bob: { name: 'Robert' } }
   *
   * __Immutability:__
   * This is an immutable function, and will return a new object. It won't
   * modify your original object.
   *
   *     profile = scour({ name: 'John' })
   *     profile2 = profile.set('email', 'john@gmail.com')
   *
   *     profile.value   // => { name: 'John' }
   *     profile2.value  // => { name: 'John', email: 'john@gmail.com' }
   *
   * __Using within a scope:__
   * Be aware that using all writing methods ([set()], [del()], [extend()]) on
   * scoped objects (ie, made with [go()]) will spawn a new [root] object. If
   * you're keeping a reference to the root object, you'll need to update it
   * accordingly.
   *
   *     db = scour(data)
   *     book = db.go('book')
   *     book.root === db       // correct so far
   *
   *     book = book.set('title', 'IQ84')
   *     book = book.del('sale_price')
   *     book.root !== db      // `root` has been updated
   *
   * __Dot notation:__
   * Like [go()] and [get()], the keypath can be given in dot notation or an
   * array.
   *
   *     scour(data).set('menu.left.visible', true)
   *     scour(data).set(['menu', 'left', 'visible'], true)
   */

  set (keypath, value) {
    keypath = normalizeKeypath(keypath)

    if (this.root !== this) {
      return this.root
        .set(this.keypath.concat(keypath), value).go(this.keypath)
    }

    const result = scour.set(this.value, keypath, value)
    return this.replace(result, { root: null })
  },

  /**
   * Deletes values immutably. Returns a copy of the same object
   * ([scour]-wrapped) with the modifications applied.
   *
   * Like [set()], the keypath can be given in dot notation or an
   * array.
   *
   *    scour(data).del('menu.left.visible')
   *    scour(data).del(['menu', 'left', 'visible'])
   *
   * See [set()] for more information on working with immutables.
   */

  del (keypath) {
    keypath = normalizeKeypath(keypath)

    if (this.root !== this) {
      return this.root.del(this.keypath.concat(keypath)).go(this.keypath)
    }

    const result = scour.del(this.value, keypath)
    return this.replace(result, { root: null })
  },

  /**
   * extend : extend(objects...)
   * Extends the data with more values. Returns a [scour]-wrapped object. Only
   * supports objects; arrays and non-objects will return undefined. Just like
   * [Object.assign], you may pass multiple objects to the parameters.
   *
   *    data  = { a: 1, b: 2 }
   *    data2 = scour(data).extend({ c: 3 })
   *
   *    data2  // => [scour { a: 1, b: 2, c: 3 }]
   *    data2.value   // => { a: 1, b: 2, c: 3 }
   *
   * See [set()] for more information on working with immutables.
   */

  extend () {
    if (typeof this.value !== 'object' || Array.isArray(this.value)) return
    var result = {}
    assign(result, this.value)
    for (var i = 0, len = arguments.length; i < len; i++) {
      if (typeof arguments[i] !== 'object') return
      assign(result, arguments[i])
    }

    if (this.root !== this) {
      return this.root.set(this.keypath, result).go(this.keypath)
    }

    return this.replace(result)
  },

  /**
   * Utility methods:
   * (Section) For stuff.
   */

  /**
   * use : use(extensions)
   * Extends functionality for certain keypaths with custom methods.
   * See [Extensions example] for examples.
   *
   *     data =
   *       { users:
   *         { 12: { name: 'steve', surname: 'jobs' },
   *           23: { name: 'bill', surname: 'gates' } } }
   *
   *     extensions = {
   *       'users.*': {
   *         fullname () {
   *           return this.get('name') + ' ' + this.get('surname')
   *         }
   *       }
   *     }
   *
   *     scour(data)
   *       .use(extensions)
   *       .get('users', 12)
   *       .fullname()       // => 'bill gates'
   *
   * __Extensions format:__
   * The parameter `extension` is an object, with keys being keypath globs, and
   * values being properties to be extended.
   *
   *     .use({
   *       'books.*': { ... },
   *       'authors.*': { ... },
   *       'publishers.*': { ... }
   *      })
   *
   * __Extending root:__
   * To bind properties to the root method, use an empty string as the keypath.
   *
   *     .use({
   *       '': {
   *         users() { return this.go('users') },
   *         authors() { return this.go('authors') }
   *       }
   *     })
   *
   * __Keypath filtering:__
   * You can use glob-like `*` and `**` to match parts of a keypath. A `*` will
   * match any one segment, and `**` will match one or many segments. Here are
   * some examples:
   *
   * - `users.*` - will match `users.1`, but not `users.1.photos`
   * - `users.**` - will match `users.1.photos`
   * - `users.*.photos` - will match `users.1.photos`
   * - `**` will match anything
   *
   * __When using outside root:__
   * Any extensions in a scoped object (ie, made with [go()]) will be used relative
   * to it. For instance, if you define an extension to `admins.*` inside
   * `.go('users')`, it will affect `users.
   *
   *     data = { users: { john: { } }
   *     db = scour(data)
   *
   *     users = db.go('users')
   *       .use({ '*': { hasName () { return !!this.get('name') } })
   *
   *     users.go('john').hasName()      // works
   *
   * While this is supported, it is *not* recommended: these extensions will not
   * propagate back to the root, and any objects taken from the root will not
   * have those extensions applied to them.
   *
   *     users.go('john').hasName()              // works
   *     db.go('users.john').hasName()           // doesn't work
   */

  use (spec) {
    const extensions = buildExtensions(this.keypath, spec)
    if (this.root === this) {
      return this.replace(this.value, { extensions, root: null })
    } else {
      // Spawn a new `root` with the extensions applied
      return this.root
        .replace(this.root.value, { extensions, root: null })
        .replace(this.value, { keypath: this.keypath })
    }
  },

  /**
   * Returns the value for serialization. This allows `JSON.stringify()` to
   * work with `scour`-wrapped objects. The name of this method is a bit
   * confusing, as it doesn't actually return a JSON string — but I'm afraid
   * that it's the way that the JavaScript API for [JSON.stringify] works.
   *
   * [JSON.stringify]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON%28%29_behavior
   */

  toJSON () {
    return this.value
  },

  valueOf () {
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
   * forEach : forEach(function(item, key))
   * Loops through each item. Supports both arrays and objects. The `item`s
   * passed to the function will be returned as a [scour] instance.
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
   * The value being passed onto the function is going to be a [scour] object.
   * Use `item.value` or `this` to access the raw values.
   */

  forEach (fn) {
    scour.each(this.value, (val, key) => {
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
   * map : map(function(item, key))
   * Loops through each item and returns an array based on the iterator's
   * return values. Supports both arrays and objects. The `item`s passed to
   * the function will be returned as a [scour] instance.
   *
   *     users =
   *       { 12: { name: 'steve' },
   *         23: { name: 'bill' } }
   *
   *     names = scour(users).map((user, key) => user.get('name'))
   *     // => [ 'steve', 'bill' ]
   */

  map: thisify(require('./utilities/map')),

  /**
   * Internal: spawns an instance with a given data and keypath.
   */

  _get (result, keypath) {
    if (typeof result === 'undefined' || result === null) return result
    return this.replace(result, {
      keypath: this.keypath.concat(keypath)
    })
  },

  /**
   * Internal: Returns a clone with the `value` replaced. The new instance will
   * retain the same properties, so things like [use()] extensions are carried
   * over. You may pass additional `options`.
   *
   *     db = scour(data)
   *     db = db.replace(newData)
   *
   * I don't think this will be useful outside internal use.
   */

  replace (value, options) {
    const op = options || {}
    return new scour(value || this.value, {
      root:
        typeof op.root !== 'undefined' ? op.root : this.root,
      keypath:
        typeof op.keypath !== 'undefined' ? op.keypath : this.keypath,
      extensions: typeof op.extensions !== 'undefined'
        ? this.extensions.concat(op.extensions)
        : this.extensions
    })
  },

  /**
   * Internal: applies extensions
   */

  applyExtensions () {
    var path = this.keypath.join('.')

    this.extensions.forEach((extension) => {
      // extension is [ RegExp, properties object ]
      if (extension[0].test(path)) assign(this, extension[1])
    })
  }
}

/**
 * Utility functions:
 * (Section) These are utilities that don't need a wrapped object.
 */

/**
 * scour.set : scour.set(object, keypath, value)
 * Sets a `keypath` into an `object` immutably.
 *
 *     data = { users: { bob: { name: 'john' } } }
 *
 *     result = set(data, ['users', 'bob', 'name'], 'robert')
 *     // => { users: { bob: { name: 'robert' } } }
 *
 * This is also available as `require('scourjs/utilities/set')`.
 */

scour.set = require('./utilities/set')

/**
 * scour.del : scour.del(object, keypath)
 * Deletes a `keypath` from an `object` immutably.
 *
 *     data = { users: { bob: { name: 'robert' } } }
 *     result = del(data, ['users', 'bob', 'name'])
 *
 *     // => { users: { bob: {} } }
 *
 * This is also available as `require('scourjs/utilities/del')`.
 */

scour.del = require('./utilities/del')

/**
 * scour.each : scour.each(iterable, fn)
 * Iterates through `iterable`, either an object or an array. This is an
 * implementation of `Array.forEach` that also works for objects.
 *
 * This is also available as `require('scourjs/utilities/each')`.
 */

scour.each = require('./utilities/each')

/**
 * scour.map : scour.map(iterable, fn)
 * Works like Array#map, but also works on objects.
 *
 * This is also available as `require('scourjs/utilities/map')`.
 */

scour.map = require('./utilities/map')

/**
 * Internal: decorates collection functions
 */

function thisify (fn) {
  return function () {
    return fn.bind(null, this.forEach.bind(this)).apply(this, arguments)
  }
}

module.exports = scour
