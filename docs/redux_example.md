# Redux example

(I'll explain later.)

```js
import { createStore } from 'redux'

function reducer (state, action) {
  // state is a scour-wrapped object.
  switch (action.type) {
    case 'RESET':
      return state.set(action.data)

    case 'PLAY':
      return state.set('audio.state', 'playing')

    case 'STOP':
      return state.set('audio.state', 'stopped')

    case 'PLAY_TRACK':
      var track = state.go('tracks', action.trackId)
      return state.set('audio.current_track', track)
  }
}

createStore(reducer, scour({}))
```
