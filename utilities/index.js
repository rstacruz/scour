
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
 * implementation of `Array.forEach` that also works for objects.
 *
 * This is also available as `require('scourjs/utilities/each')`.
 */

exports.each = require('./each')

/**
 * scour.map : scour.map(iterable, fn)
 * Works like Array#map, but also works on objects.
 *
 * This is also available as `require('scourjs/utilities/map')`.
 */

exports.map = require('./map')

/**
 * Internal: works like map, but returns an object (TBD)
 */

exports.mapObject = require('./map_object')
