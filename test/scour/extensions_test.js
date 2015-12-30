'use strict'

const test = require('tape')
const scour = require('../../src')

var data, extensions, albums, db, artist

data =
  { artists:
    { 1: { id: 1, name: 'Ella Fitzgerald' },
      2: { id: 2, name: 'Frank Sinatra' },
      3: { id: 3, name: 'Miles Davis' },
      4: { id: 4, name: 'Taylor Swift' } },
    albums:
    { 1: { id: 1, name: 'Kind of Blue', genre: 'Jazz', artist_id: 3 },
      2: { id: 2, name: 'Come Fly With Me', genre: 'Jazz', artist_id: 2 },
      3: { id: 3, name: '1984', genre: 'Pop', artist_id: 4 } } }

extensions = {
  '': {
    artists () { return this.go('artists') },
    albums () { return this.go('albums') }
  },

  'artists.*': {
    albums () {
      // Defines a has-many relationship
      return this.root.albums().filter({ artist_id: this.get('id') })
    }
  },

  'albums.*': {
    artist () {
      // Defines a belongs-to relationship
      return this.root.artists().go(this.get('artist_id'))
    }
  }
}

test('.use(): .albums()', (t) => {
  db = scour(data).use(extensions)
  albums = db.albums().filter({ genre: 'Jazz' })

  t.deepEqual(albums.at(0).get('name'), 'Kind of Blue')
  t.deepEqual(albums.at(1).get('name'), 'Come Fly With Me')
  t.deepEqual(albums.at(2).value, undefined)
  t.deepEqual(albums.len(), 2)
  t.end()
})

test('.use(): .artists().find().albums()', (t) => {
  db = scour(data).use(extensions)

  artist = db
    .artists()
    .find({ name: 'Taylor Swift' })

  albums = artist.albums()

  t.deepEqual(albums.at(0).get('name'), '1984')
  t.deepEqual(albums.len(), 1)
  t.end()
})
