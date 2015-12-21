var define

if (Object.defineProperty) {
  define = function define (object, property, value) {
    Object.defineProperty(object, property, {
      configurable: true,
      enumerable: false,
      writable: true,
      value: value
    })
  }
} else {
  define = function define (object, property, value) {
    object[property] = value
  }
}

module.exports = define
