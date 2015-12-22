/*
 * Collection helpers.
 *
 * For each of these functions, call it in the context of an object that responds to `forEach`.
 */

module.exports = {
  map (fn) {
    const result = []
    this.forEach(function () { result.push(fn.apply(this, arguments)) })
    return result
  }
}
