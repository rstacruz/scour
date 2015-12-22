# Redux example

(I'll explain more later.)

If all your reducers are going to be using scour, you can set your `state` as a scour-wrapped object.

```js
import { createStore } from 'redux'

function reducer (state, action) {
  // `state` is a scour-wrapped object.
  switch (action.type) {
    case 'LOAD_TRACKS':
      return state.set('tracks', action.data)

    case 'PLAY':
      return state.set('audio.state', 'playing')

    case 'STOP':
      return state.set('audio.state', 'stopped')

    case 'SELECT_TRACK':
      var track = state.go('tracks', action.trackId)
      return state.set('audio.current_track', track)
  }
}

store = createStore(reducer, scour({}))
```

### Dispatching events

Here's an example.

```js
store.dispatch({
  type: 'LOAD_TRACKS',
  data: {
    1: { title: 'Levels', artist: 'Avicii' },
    2: { title: 'Bonfire', artist: 'Knife Party' },
    3: { title: 'Hello', artist: 'Adele' }
  }
})

store.dispatch({ type: 'SELECT_TRACK', 3 })
store.dispatch({ type: 'PLAY' })
```

### Using with React

Hmm... I'll explain later.
