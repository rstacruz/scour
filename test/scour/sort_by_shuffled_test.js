'use strict'

const scour = require('../../scour')

// Adapted from _.shuffle
function shuffle (set) {
  var length = set.length
  var shuffled = Array(length)
  for (var index = 0, rand; index < length; index++) {
    rand = (Math.random() * (index + 1)) | 0
    if (rand !== index) shuffled[index] = shuffled[rand]
    shuffled[rand] = set[index]
  }
  return shuffled
};

describe('.sortBy() (shuffled)', function () {
  const list = [ 8, 20, 23, 39, 58, 83, 95, 104, 294, 1005 ]
    .map((n) => ({ number: n }))

  it('works', function () {
    for (var i = 0; i < 20; i++) {
      const shuffled = shuffle(list)
      expect(scour(shuffled).sortBy('number').value).toEqual(list)
    }
  })
})
