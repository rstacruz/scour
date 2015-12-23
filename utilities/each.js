var native = Array.prototype.forEach

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
    if (native) return native.call(list, fn)
    /* istanbul ignore next */
    for (i = 0; i < len; i++) fn(list[i], i, i)
  } else {
    idx = 0
    for (i in list) {
      /* istanbul ignore next */
      if (list.hasOwnProperty(i)) fn(list[i], i, idx++)
    }
  }

  return list
}

module.exports = each
