# Klondike

[Klondike Solitaire](<https://en.wikipedia.org/wiki/Klondike_(solitaire)>) built with [React](https://reactjs.org).

You can try it out [here](https://bradleydonahue.me/klondike/).

## Features

- Point and click controls
- Scoring based on [Windows Solitaire](<https://en.wikipedia.org/wiki/Klondike_(solitaire)#Computerized_versions>)
- Draw 1 and Draw 3 modes

## Todo

- [x] Time based scoring mode
- [-] Add scoreboard of most recent wins (last five or ten?)
  - [x] End game screen with recent wins.
  - [ ] Stats screen with more info.
- [x] Refactor to useReducer for main klondike state
- [ ] New game confirmation when in the middle of a game
- [ ] Drag and drop controls (with option to switch between perhaps)
- [ ] Figure out what's needed to make it installable (a PWA)
- [ ] Bugfix: If a card in waste is selected and then the waste is recycled back into stock a subsequent click on a card in a tableau (and probably a foundation) will throw a `card is undefined` error.
- [x] Save in progress game state to restore on page load
- [ ] Undo history
