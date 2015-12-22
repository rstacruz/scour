const forEach = require('./each')

/*
 * Collection helpers.
 *
 *     map(each, (val) => val * 2)
 *     map(array, (val) => val * 2)
 */

module.exports = {
  map (each, fn) {
    if (typeof each !== 'function') each = forEach.bind(this, each)
    const result = []
    each(function () { result.push(fn.apply(this, arguments)) })
    return result
  }
}
