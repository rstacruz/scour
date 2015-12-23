/**
 * each : each(list, fn)
 * Iterates through `list` (an array or an object). This is useful when dealing
 * with NodeLists like `document.querySelectorAll`.
 */

function each (list, fn) {
  if (!list) return

  var i
  var len = list.length
  var idx

  if (typeof len === 'number') {
    if (each.native) return each.native.call(list, fn)
    for (i = 0; i < len; i++) fn(list[i], i, i)
  } else {
    idx = 0
    for (i in list) {
      if (list.hasOwnProperty(i)) fn(list[i], i, idx++)
    }
  }

  return list
}

each.native = Array.prototype.forEach

module.exports = each
