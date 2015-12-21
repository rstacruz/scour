/*
 * Collection helpers.
 *
 * For each of these functions, pass an object that responds to `forEach`.
 */

module.exports = {
  map (list, fn) {
    const result = []
    list.forEach(function () { result.push(fn.apply(this, arguments)) })
    return result
  }
}
