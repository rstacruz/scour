/**
 * each : each(list, fn)
 * Iterates through `list` (an array or an object). This is useful when dealing
 * with NodeLists like `document.querySelectorAll`.
 *
 *     var each = require('dom101/each')
 *     var qa = require('dom101/query-selector-all')
 *
 *     each(qa('.button'), function (el) {
 *       addClass('el', 'selected')
 *     })
 */

function each (list, fn) {
  var i
  var len = list.length
  var idx

  if (typeof len === 'number') {
    for (i = 0; i < len; i++) fn(list[i], i)
  } else {
    idx = 0
    for (i in list) {
      if (list.hasOwnProperty(i)) fn(list[i], i, idx++)
    }
  }

  return list
}

module.exports = each
