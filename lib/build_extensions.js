'use strict'

const map = require('../utilities/collections').map

/**
 * Internal: builds extensions based on parameters passed onto `.use()`.
 *
 *     buildExtensions({ 'users.*': props })
 *     // => [ /^users\.[^.]+$/, props ]
 */

module.exports = function buildExtensions (keypath, extensions) {
  let prefix = keypath.length ? (keypath.join('.') + '.') : ''
  return map(extensions, (properties, keypath) => {
    keypath = (prefix + keypath)
      .replace(/\./g, '\\.')
      .replace(/\*\*/g, '::all::')
      .replace(/\*/g, '::any::')
      .replace(/::all::/g, '.*')
      .replace(/::any::/g, '[^\.]+')

    keypath = new RegExp('^' + keypath + '$')
    return [ keypath, properties ]
  })
}
