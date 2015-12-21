'use strict'

const each = require('./lib/each')
const assign = require('object-assign')

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
  this.data = data
  this.root = options && options.root || this
  this.keypath = options && options.keypath || []
  this.extensions = options && options.extensions || []

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
   * Returns the item at `index`.
   */

  at (index) {
    const key = Object.keys(this.data)[index]
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
   * Extends functionality with some prototype.
   */

  extend (props) {
    return this.clone({ extensions: [props] })
  }
}

module.exports = Scour
