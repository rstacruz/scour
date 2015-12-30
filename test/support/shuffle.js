/*
 * Adapted from _.shuffle
 */

module.exports = function shuffle (set) {
  var length = set.length
  var shuffled = Array(length)
  for (var index = 0, rand; index < length; index++) {
    rand = (Math.random() * (index + 1)) | 0
    if (rand !== index) shuffled[index] = shuffled[rand]
    shuffled[rand] = set[index]
  }
  return shuffled
};

