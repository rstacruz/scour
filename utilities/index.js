
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

exports.set = require('./set')

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

exports.del = require('./del')

/**
 * scour.each : scour.each(iterable, fn)
 * Iterates through `iterable`, either an object or an array. This is an
 * implementation of [Array#forEach] that also works for objects.
 *
 * The callback `fn` will be invoked with two parameters: `currentValue` and
 * `key`, just like `Array#forEach`.
 *
 * This is also available as `require('scourjs/utilities/each')`.
 */

exports.each = require('./each')

/**
 * scour.map : scour.map(iterable, fn)
 * Creates a new `Array` with with the results of calling a provided function
 * on every element in this array. Works like [Array#map], but also works on
 * objects as well as arrays.
 *
 * The callback `fn` will be invoked with two parameters: `currentValue` and
 * `key`, just like `Array#map`.
 *
 * This is also available as `require('scourjs/utilities/map')`.
 */

exports.map = require('./map')

/**
 * scour.indexedMap : scour.indexedMap(iterable, fn)
 * Creates a new `Object` with with the results of calling a provided function
 * returning the keys and values for the new object.
 *
 * The callback `fn` will be invoked with two parameters: `currentValue` and
 * `key`, just like `Array#map`.
 *
 * The callback `fn` should return an array with two elements: with `result[0]`
 * being the key, and `result[1]` being the value. These are what the new
 * object will be constructed with.
 *
 * The `iterable` parameter can be an object or an array. This works like
 * `Array#map`, but also works on objects as well as arrays.
 *
 *     list = ['Fred', 'Barney', 'Wilma']
 *
 *     object = scour.indexedMap(list, (val, key) => {
 *       var newkey = val.substr(0, 1)
 *       return [ newkey, val ]
 *     })
 *
 *     // => { f: 'Fred', b: 'Barney', w: 'Wilma' }
 */

exports.indexedMap = require('./indexed_map')
