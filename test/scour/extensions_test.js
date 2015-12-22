'use strict'

const scour = require('../../scour')

describe('extensions', function () {
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

  const extensions = {
    '': {
      artists () { return this.go('artists') },
      albums () { return this.go('albums') }
    },

    'artists.*': {
      // Defines a has-many relationship
      albums () {
        return this.root.albums().filter({ artist_id: this.get('id') })
      }
    },

    'albums.*': {
      // Defines a belongs-to relationship
      artist () {
        return this.root.artists().go(this.get('artist_id'))
      }
    }
  }

  it('.albums()', function () {
    const db = scour(data).use(extensions)
    const albums = db.albums().filter({ genre: 'Jazz' })

    expect(albums.at(0).get('name')).toEqual('Kind of Blue')
    expect(albums.at(1).get('name')).toEqual('Come Fly With Me')
    expect(albums.at(2)).toEqual(undefined)
    expect(albums.len()).toEqual(2)
  })

  it('.artists().find().albums()', function () {
    const db = scour(data).use(extensions)

    const artist = db
      .artists()
      .find({ name: 'Taylor Swift' })

    const albums = artist.albums()

    expect(albums.at(0).get('name')).toEqual('1984')
    expect(albums.len()).toEqual(1)
  })
})
