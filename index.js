'use strict'

/*
 * scour
 */

function Scour (object) {
  if (!(this instanceof Scour)) return new Scour(object)
  this.data = object
  this.root = this
}

Scour.prototype = {
  get () {
    var result = this.data
    ;[].slice.apply(arguments).forEach((spec) => {
      if (result) result = result[spec]
    })

    if (typeof result === 'object') {
      return new Scour(result)
    } else {
      return result
    }
  }
}

module.exports = Scour
