/* eslint-disable new-cap, no-new */
'use strict'

const bm = require('./bm')
const scour = require('../scour.js')

const data =
  { artists:
    { 1: { id: 1, name: 'Ella Fitzgerald' },
      2: { id: 2, name: 'Frank Sinatra' },
      3: { id: 3, name: 'Miles Davis' },
      4: { id: 4, name: 'Taylor Swift' } },
    albums:
    { 1: { id: 1, name: 'Kind of Blue', genre: 'Jazz', artist_id: 3 },
      2: { id: 2, name: 'Come Fly With Me', genre: 'Jazz', artist_id: 2 },
      3: { id: 3, name: '1984', genre: 'Pop', artist_id: 4 } } }

class SimpleClass {
  constructor (data, options) {
    this.data = data
    this.root = options && options.root || this
    this.keypath = options && options.keypath || []
    this.extensions = options && options.extensions || []
  }
}

bm('initializing', {
  'initializing root': function () {
    new scour(data)
  },
  'initializing using a simple class': function () {
    new SimpleClass(data)
  }
})
