import { useReducer, useState, useEffect } from 'react'
import GameOverModal from './GameOverModal'
import Button from './Button'
import { useLocalStorage } from './utils/hooks'

const rankSymbols = {
  ace: 'A',
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  jack: 'J',
  queen: 'Q',
  king: 'K',
}

const suitSymbols = {
  heart: '♥️',
  diamond: '♦️',
  club: '♣️',
  spade: '♠️',
}

const ranks = {
  ace: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  jack: 11,
  queen: 12,
  king: 13,
}

const suits = {
  spade: 'spade',
  club: 'club',
  diamond: 'diamond',
  heart: 'heart',
}

function shuffle(cards) {
  for (let i = cards.length - 1; i >= 1; i--) {
    let j = Math.floor(Math.random() * (i - 0 + 1) + 0)
    let temp = cards[i]
    cards[i] = cards[j]
    cards[j] = temp
  }
}

function isValidTableauMove(card, destinationCard) {
  if (!destinationCard) return card.rank === 'king'

  let isRed = card.suit === 'diamond' || card.suit === 'heart'
  let isBlack = !isRed
  let destinationIsRed = destinationCard.suit === 'diamond' || destinationCard.suit === 'heart'
  let destinationIsBlack = !destinationIsRed

  return (
    (isRed && destinationIsBlack && ranks[card.rank] === ranks[destinationCard.rank] - 1) ||
    (isBlack && destinationIsRed && ranks[card.rank] === ranks[destinationCard.rank] - 1)
  )
}

function isValidFoundationMove(card, destinationCard) {
  if (!destinationCard) return card.rank === 'ace'
  return card.suit === destinationCard.suit && ranks[card.rank] === ranks[destinationCard.rank] + 1
}

function Card({ rank, suit, style, faceUp, id, isSelected, handleDoubleClick }) {
  let rankSymbol = rankSymbols[rank]
  let suitSymnbol = suitSymbols[suit]
  return (
    <div
      className={`card absolute w-[50px] md:w-[75px] h-[100px] md:h-[125px] p-0.5 rounded-md
        ${isSelected ? 'border-2 border-yellow-300' : 'border border-black'}
        ${faceUp ? 'bg-white dark:bg-zinc-700' : 'bg-[green] dark:bg-zinc-800'}
        ${suit === suits.spade || suit === suits.club ? 'text-black dark:text-white' : 'text-red-600'}`}
      id={id}
      style={{
        ...style,
      }}
      onDoubleClick={(e) => {
        handleDoubleClick({
          rank,
          suit,
          faceUp,
          id,
          containingPile: e.target.parentElement.dataset.pile,
        })
      }}
    >
      {faceUp ? `${rankSymbol} ${suitSymnbol}` : null}
    </div>
  )
}

function createInitialState({ initialDrawMode, savedState }) {
  // Catches savedState object with gameState and historyIndex
  if (savedState?.gameState) {
    return savedState.gameState
  }
  // Catches pre-undo version
  if (savedState) {
    return Array.isArray(savedState) ? savedState : [savedState]
  }

  let deck = []
  let i = 1
  Object.keys(ranks).forEach((rank) => {
    Object.keys(suits).forEach((suit) => {
      deck.push({
        id: `c${i++}`,
        faceUp: false,
        rank,
        suit,
      })
    })
  })
  shuffle(deck)

  let state = {
    drawMode: initialDrawMode,
    score: 0,
    foundations: [[], [], [], []],
    waste: [],
    tableaux: [],
    startTime: Date.now(),
    duration: 0,
  }

  for (let i = 1; i < 8; i++) {
    state.tableaux.push(deck.splice(-i))
    state.tableaux[i - 1].at(-1).faceUp = true
  }

  state.stock = deck
  return [state]
}

function klondikeReducer(state, action) {
  let currentGameState = state.at(action.historyIndex)
  switch (action.type) {
    case 'move_foundation_to_foundation':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          foundations: currentGameState.foundations
            .map((f) => {
              return f.filter((c) => c.id !== action.card.id)
            })
            .map((f, i) => {
              if (i === action.targetId) {
                return [...f, action.card]
              }
              return f
            }),
        },
      ]
    case 'move_waste_to_foundation':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          score: currentGameState.score + 10,
          waste: currentGameState.waste.filter((c) => c.id !== action.card.id),
          foundations: currentGameState.foundations.map((f, i) => {
            if (i === action.targetId) {
              return [...f, action.card]
            }
            return f
          }),
        },
      ]
    case 'move_tableau_to_foundation':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          score: action.previousCard?.faceUp ? currentGameState.score + 10 : currentGameState.score + 15,
          tableaux: currentGameState.tableaux.map((t) => {
            return t
              .filter((c) => c.id !== action.card.id)
              .map((c, i, a) => {
                if (i === a.length - 1) {
                  return { ...c, faceUp: true }
                }
                return c
              })
          }),
          foundations: currentGameState.foundations.map((f, i) => {
            if (i === action.targetId) {
              return [...f, action.card]
            }
            return f
          }),
        },
      ]
    case 'move_foundation_to_tableau':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          score: Math.max(currentGameState.score - 15, 0),
          foundations: currentGameState.foundations.map((f) => {
            return f.filter((c) => c.id !== action.card.id)
          }),
          tableaux: currentGameState.tableaux.map((t, i) => {
            if (i === action.targetId) {
              return [...t, action.card]
            }
            return t
          }),
        },
      ]
    case 'move_waste_to_tableau':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          score: currentGameState.score + 5,
          waste: currentGameState.waste.filter((c) => c.id !== action.card.id),
          tableaux: currentGameState.tableaux.map((t, i) => {
            if (i == action.targetId) {
              return [...t, action.card]
            }
            return t
          }),
        },
      ]
    case 'move_stack_to_tableau':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          score: action.previousCard?.faceUp ? currentGameState.score : currentGameState.score + 5,
          tableaux: currentGameState.tableaux
            .map((t) => {
              return t
                .filter((c) => !action.cards.includes(c))
                .map((c, i, a) => {
                  if (i === a.length - 1) {
                    return { ...c, faceUp: true }
                  }
                  return c
                })
            })
            .map((t, i) => {
              if (i == action.targetId) {
                return [...t, ...action.cards]
              }
              return t
            }),
        },
      ]
    case 'change_draw_mode':
      let initialState = createInitialState()
      return {
        ...initialState,
        drawMode: action.value,
      }
    case 'reset_waste':
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          score: currentGameState.drawMode === 1 ? Math.max(currentGameState.score - 100, 0) : currentGameState.score,
          stock: currentGameState.waste
            .map((card) => {
              return {
                ...card,
                faceUp: false,
              }
            })
            .reverse(),
          waste: [],
        },
      ]
    case 'draw': {
      let cards = currentGameState.stock
        .slice(-currentGameState.drawMode)
        .map((c) => ({ ...c, faceUp: true }))
        .reverse()
      return [
        ...state.slice(0, action.historyIndex + 1),
        {
          ...currentGameState,
          stock: currentGameState.stock.slice(0, -currentGameState.drawMode),
          waste: [...currentGameState.waste, ...cards],
        },
      ]
    }
    case 'invalid_move':
      // return { ...currentGameState }
      return state
  }
  throw Error('Unknown action: ' + action.type)
}

function KlondikeSolitaire({
  scores,
  updateScores,
  updateGamesPlayed,
  onNewGame,
  initialDrawMode,
  savedState,
  updateSavedState,
  setSettings,
}) {
  let [state, dispatch] = useReducer(klondikeReducer, { initialDrawMode, savedState }, createInitialState)
  let [historyIndex, setHistoryIndex] = useState(savedState?.historyIndex ?? 0)
  let [duration, setDuration] = useState(savedState?.duration ?? 0)

  let [selectedCard, setSelectedCard] = useState()
  let [hasStarted, setHasStarted] = useState(false)

  let { score, stock, waste, foundations, tableaux, drawMode } = state[historyIndex]

  let checkIsGameOver = (foundations) => foundations.every((f) => f.length === 13)
  let isGameOver = checkIsGameOver(foundations)
  let finalScore = isGameOver ? score + Math.round(700_000 / duration) : score
  useEffect(() => {
    if (isGameOver) {
      updateSavedState(null)
      updateScores({
        score: finalScore,
        date: Date.now(),
        duration,
        drawMode,
      })
      return
    }
    if (hasStarted) {
      let id = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)
      return () => {
        clearInterval(id)
      }
    }
  }, [isGameOver, hasStarted])

  useEffect(() => {
    if (hasStarted) {
      updateSavedState({ gameState: state, historyIndex, duration })
    }
  }, [state, historyIndex, duration])

  function handleCardDoubleClick(card) {
    if (!hasStarted) {
      setHasStarted(true)
    }
    if (!card.faceUp) return
    let targetFoundation = foundations.findIndex((f) =>
      f.length === 0 ? isValidFoundationMove(card, null) : f.some((c) => isValidFoundationMove(card, c))
    )
    if (targetFoundation === -1) {
      dispatch({ type: 'invalid_move' })
    } else if (card.containingPile === 'tableau') {
      let tableau = tableaux.find((t) => t.some((c) => c.id === card.id))
      let cardIndex = tableau.findIndex((c) => c.id === card.id)
      let previousCard = tableau.at(cardIndex - 1)
      // TODO: Can we get this information before this point and perhaps bail earlier
      let isTopCard = card.id === tableau.at(-1).id
      if (!isTopCard) return
      dispatch({
        type: 'move_tableau_to_foundation',
        targetId: targetFoundation,
        previousCard,
        card,
        historyIndex,
      })
      setHistoryIndex(historyIndex + 1)
    } else if (card.containingPile === 'waste') {
      // TODO: Can we get this information before this point and perhaps bail earlier
      let isTopCard = card.id === waste.at(-1).id
      if (!isTopCard) return
      dispatch({
        type: 'move_waste_to_foundation',
        targetId: targetFoundation,
        card,
        historyIndex,
      })
      setHistoryIndex(historyIndex + 1)
    }
    setSelectedCard(null)
  }

  return (
    <div className="flex flex-col flex-grow space-y-4">
      <GameOverModal isGameOver={isGameOver} scores={scores} finalScore={finalScore} drawMode={drawMode}>
        <Button onClick={onNewGame} className="w-full bg-black text-white font-bold hover:bg-zinc-800">
          New Game
        </Button>
      </GameOverModal>
      <div className="flex gap-4">
        <Button
          onClick={() => {
            if (hasStarted) {
              updateGamesPlayed(drawMode)
            }
            onNewGame()
          }}
          className="bg-black hover:bg-zinc-800 text-white font-bold"
        >
          New Game
        </Button>
        <Button
          className="flex-grow md:flex-grow-0"
          onClick={(e) => {
            setSettings((s) => {
              return { ...s, drawMode: 1 }
            })
            if (hasStarted) {
              updateGamesPlayed(drawMode)
            }
            onNewGame()
          }}
          disabled={drawMode === 1}
        >
          Draw 1
        </Button>
        <Button
          className="flex-grow md:flex-grow-0"
          onClick={(e) => {
            setSettings((s) => {
              return { ...s, drawMode: 3 }
            })
            if (hasStarted) {
              updateGamesPlayed(drawMode)
            }
            onNewGame()
          }}
          disabled={drawMode === 3}
        >
          Draw 3
        </Button>
        <Button
          className="px-2"
          onClick={() => {
            setHistoryIndex((c) => (c === 0 ? 0 : c - 1))
          }}
          disabled={historyIndex === 0}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </Button>
      </div>
      <p className="flex gap-4 items-center justify-center">
        <span>Score: {score}</span> <span className="tabular-nums">Duration: {duration}</span>
      </p>
      <div
        className="play-area select-none flex-grow"
        onClick={(e) => {
          if (!hasStarted) {
            setHasStarted(true)
          }
          if (e.target.matches('.stock') || e.target.matches('.stock .card')) {
            if (stock.length === 0) {
              dispatch({ type: 'reset_waste', historyIndex })
              setHistoryIndex(historyIndex + 1)
            } else {
              dispatch({ type: 'draw', historyIndex })
              setHistoryIndex(historyIndex + 1)
            }
          } else if (e.target.matches('.tableau') || e.target.matches('.tableau .card')) {
            if (selectedCard) {
              let tableauEl = e.target.matches('.card') ? e.target.parentElement : e.target
              let id = Number(tableauEl.id.replace('t', ''))
              let { containingPile } = selectedCard

              if (containingPile === 'tableau') {
                let tIndex = tableaux.findIndex((t) => t.some((c) => c.id === selectedCard.id))
                let cardIndex = tableaux[tIndex].findIndex((c) => c.id === selectedCard.id)
                let cards = tableaux[tIndex].slice(cardIndex)
                let card = cards[0]
                let destinationCard = tableaux[id].at(-1)
                // the card below the selected one
                let previousCard = tableaux[tIndex].at(cardIndex - 1)

                if (!isValidTableauMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_stack_to_tableau',
                    targetId: id,
                    previousCard,
                    cards,
                    historyIndex,
                  })
                  setHistoryIndex(historyIndex + 1)
                }
              } else if (containingPile === 'waste') {
                let card = waste.find((c) => c.id === selectedCard.id)
                let destinationCard = tableaux[id].at(-1)
                // TODO: Can we get this information before this point and perhaps bail earlier
                let isTopCard = card === waste.at(-1)

                if (!isTopCard || !isValidTableauMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_waste_to_tableau',
                    targetId: id,
                    card,
                    historyIndex,
                  })
                  setHistoryIndex(historyIndex + 1)
                }
              } else if (containingPile === 'foundation') {
                let foundationIndex = foundations.findIndex((f) => f.some((c) => c.id === selectedCard.id))
                let card = foundations[foundationIndex].find((c) => c.id === selectedCard.id)
                let destinationCard = tableaux[id].at(-1)

                if (!isValidTableauMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_foundation_to_tableau',
                    targetId: id,
                    card,
                    historyIndex,
                  })
                  setHistoryIndex(historyIndex + 1)
                }
              }
              setSelectedCard(null)
            } else {
              if (e.target.matches('.card')) {
                setSelectedCard({ id: e.target.id, containingPile: e.target.parentElement.dataset.pile })
              }
            }
          } else if (e.target.matches('.foundation') || e.target.matches('.foundation .card')) {
            if (selectedCard) {
              let foundationEl = e.target.matches('.card') ? e.target.parentElement : e.target
              let id = Number(foundationEl.id.replace('f', ''))
              let { containingPile } = selectedCard
              if (containingPile === 'tableau') {
                let tIndex = tableaux.findIndex((t) => t.some((c) => c.id === selectedCard.id))
                let card = tableaux[tIndex].find((c) => c.id === selectedCard.id)
                let cardIndex = tableaux[tIndex].findIndex((c) => c.id === selectedCard.id)
                let destinationCard = foundations[id].at(-1)
                let previousCard = tableaux[tIndex].at(cardIndex - 1)
                // TODO: Can we get this information before this point and perhaps bail earlier
                let isTopCard = cardIndex === tableaux[tIndex].length - 1

                if (!isTopCard || !isValidFoundationMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_tableau_to_foundation',
                    targetId: id,
                    previousCard,
                    card,
                    historyIndex,
                  })
                  setHistoryIndex(historyIndex + 1)
                }
              } else if (containingPile === 'waste') {
                let card = waste.find((c) => c.id === selectedCard.id)
                let destinationCard = foundations[id].at(-1)
                // TODO: Can we get this information before this point and perhaps bail earlier
                let isTopCard = card === waste.at(-1)

                if (!isTopCard || !isValidFoundationMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_waste_to_foundation',
                    targetId: id,
                    card,
                    historyIndex,
                  })
                  setHistoryIndex(historyIndex + 1)
                }
              } else if (containingPile === 'foundation') {
                let foundationIndex = foundations.findIndex((f) => f.some((c) => c.id === selectedCard.id))
                let card = foundations[foundationIndex].find((c) => c.id === selectedCard.id)
                let destinationCard = foundations[id].at(-1)

                if (!isValidFoundationMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_foundation_to_foundation',
                    targetId: id,
                    card,
                    historyIndex,
                  })
                  setHistoryIndex(historyIndex + 1)
                }
              }
              setSelectedCard(null)
            } else {
              if (e.target.matches('.card')) {
                setSelectedCard({ id: e.target.id, containingPile: e.target.parentElement.dataset.pile })
              }
            }
          } else if (e.target.matches('.card')) {
            setSelectedCard({ id: e.target.id, containingPile: e.target.parentElement.dataset.pile })
          } else {
            setSelectedCard(null)
          }
        }}
      >
        <div className="upper-area flex gap-1 md:gap-4 mb-8 justify-center">
          <div className="stock-waste flex gap-1 md:gap-4 mr-[54px] md:mr-[91px]">
            <Pile type="stock">
              {stock.length ? (
                stock.map((card) => {
                  return <Card key={card.id} {...card} isSelected={card.id === selectedCard?.id} />
                })
              ) : (
                <p className="-z-[1]">Reset</p>
              )}
            </Pile>
            <Pile type="waste">
              {waste.map((card, i) => {
                if (drawMode === 3) {
                  let isTopThree = waste.length - i < 3
                  return (
                    <Card
                      key={card.id}
                      {...card}
                      isSelected={card.id === selectedCard?.id}
                      handleDoubleClick={handleCardDoubleClick}
                      style={{
                        left: isTopThree ? `${(i - waste.length + 3) * 15}px` : null,
                      }}
                    />
                  )
                }
                return (
                  <Card
                    key={card.id}
                    {...card}
                    handleDoubleClick={handleCardDoubleClick}
                    isSelected={card.id === selectedCard?.id}
                  />
                )
              })}
            </Pile>
          </div>
          <div className="foundations flex gap-1 md:gap-4">
            {foundations.map((foundation, i) => {
              return (
                <Pile id={'f' + i} key={i} type="foundation">
                  {foundation.map((card) => {
                    return <Card key={card.id} {...card} isSelected={card.id === selectedCard?.id} />
                  })}
                </Pile>
              )
            })}
          </div>
        </div>
        <div className="tableaux flex gap-1 md:gap-4 justify-center">
          {tableaux.map((tableau, i) => {
            let inStack = false
            return (
              <Pile key={i} id={`t${i}`} type="tableau">
                {tableau.map((card, i) => {
                  let isSelected = card.id === selectedCard?.id
                  if (isSelected) inStack = true
                  return (
                    <Card
                      key={card.id}
                      {...card}
                      style={{ top: i === 0 ? null : `${i * 20}px` }}
                      isSelected={inStack || isSelected}
                      handleDoubleClick={handleCardDoubleClick}
                    />
                  )
                })}
              </Pile>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Pile({ type, children, ...props }) {
  return (
    <div
      {...props}
      className={`${type} relative flex justify-center items-center w-[50px] h-[100px] border-[1px] border-gray-300 rounded-md md:w-[75px] md:h-[125px] bg-gray-300 dark:bg-zinc-600 dark:border-zinc-600`}
      data-pile={type}
    >
      {children}
    </div>
  )
}

export default KlondikeSolitaire
