import { useReducer, useState, useEffect } from 'react'
import GameOverModal from './GameOverModal'
import Button from './Button'

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
      className="card absolute w-[50px] md:w-[75px] h-[100px] md:h-[125px] p-0.5 rounded-md"
      id={id}
      style={{
        border: isSelected ? '2px solid gold' : '1px solid black',
        backgroundColor: faceUp ? 'white' : 'green',
        color: suit === suits.spade || suit === suits.club ? 'black' : 'red',
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

function createInitialState(initialDrawMode) {
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
  return state
}

function klondikeReducer(state, action) {
  switch (action.type) {
    case 'move_foundation_to_foundation':
      return {
        ...state,
        foundations: state.foundations
          .map((f) => {
            return f.filter((c) => c.id !== action.card.id)
          })
          .map((f, i) => {
            if (i === action.targetId) {
              return [...f, action.card]
            }
            return f
          }),
      }
    case 'move_waste_to_foundation':
      return {
        ...state,
        score: state.score + 10,
        waste: state.waste.filter((c) => c.id !== action.card.id),
        foundations: state.foundations.map((f, i) => {
          if (i === action.targetId) {
            return [...f, action.card]
          }
          return f
        }),
      }
    case 'move_tableau_to_foundation':
      return {
        ...state,
        score: state.score + 10,
        tableaux: state.tableaux.map((t) => {
          return t
            .filter((c) => c.id !== action.card.id)
            .map((c, i, a) => {
              if (i === a.length - 1) {
                return { ...c, faceUp: true }
              }
              return c
            })
        }),
        foundations: state.foundations.map((f, i) => {
          if (i === action.targetId) {
            return [...f, action.card]
          }
          return f
        }),
      }
    case 'move_foundation_to_tableau':
      return {
        ...state,
        score: Math.max(state.score - 15, 0),
        foundations: state.foundations.map((f) => {
          return f.filter((c) => c.id !== action.card.id)
        }),
        tableaux: state.tableaux.map((t, i) => {
          if (i === action.targetId) {
            return [...t, action.card]
          }
          return t
        }),
      }
    case 'move_waste_to_tableau':
      return {
        ...state,
        score: state.score + 5,
        waste: state.waste.filter((c) => c.id !== action.card.id),
        tableaux: state.tableaux.map((t, i) => {
          if (i == action.targetId) {
            return [...t, action.card]
          }
          return t
        }),
      }
    case 'move_stack_to_tableau':
      return {
        ...state,
        score: action.previousCard?.faceUp ? state.score : state.score + 5,
        tableaux: state.tableaux
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
      }
    case 'change_draw_mode':
      let initialState = createInitialState()
      return {
        ...initialState,
        drawMode: action.value,
      }
    case 'reset_waste':
      return {
        ...state,
        score: state.drawMode === 1 ? Math.max(state.score - 100, 0) : state.score,
        stock: state.waste
          .map((card) => {
            return {
              ...card,
              faceUp: false,
            }
          })
          .reverse(),
        waste: [],
      }
    case 'draw': {
      let cards = state.stock
        .slice(-state.drawMode)
        .map((c) => ({ ...c, faceUp: true }))
        .reverse()
      return {
        ...state,
        stock: state.stock.slice(0, -state.drawMode),
        waste: [...state.waste, ...cards],
      }
    }
    case 'invalid_move':
      return { ...state }
    case 'update_duration':
      return {
        ...state,
        duration: state.duration + 1,
      }
  }
  throw Error('Unknown action: ' + action.type)
}

function KlondikeSolitaire({ scores, updateScores, onNewGame, initialDrawMode }) {
  let [state, dispatch] = useReducer(klondikeReducer, initialDrawMode, createInitialState)

  let [selectedCard, setSelectedCard] = useState()

  let { duration, score, stock, waste, foundations, tableaux, drawMode } = state

  let checkIsGameOver = (foundations) => foundations.every((f) => f.length === 13)
  let isGameOver = checkIsGameOver(foundations)
  let finalScore = isGameOver ? score + Math.round(700_000 / duration) : score
  useEffect(() => {
    if (isGameOver) {
      updateScores({
        score: finalScore,
        date: Date.now(),
        duration,
        drawMode,
      })
      return
    }
    let id = setInterval(() => {
      dispatch({ type: 'update_duration' })
    }, 1000)
    return () => {
      clearInterval(id)
    }
  }, [isGameOver])

  function handleCardDoubleClick(card) {
    if (!card.faceUp) return
    let targetFoundation = foundations.findIndex((f) =>
      f.length === 0 ? isValidFoundationMove(card, null) : f.some((c) => isValidFoundationMove(card, c))
    )
    if (targetFoundation === -1) {
      dispatch({ type: 'invalid_move' })
    } else if (card.containingPile === 'tableau') {
      dispatch({
        type: 'move_tableau_to_foundation',
        targetId: targetFoundation,
        card,
      })
    } else if (card.containingPile === 'waste') {
      dispatch({
        type: 'move_waste_to_foundation',
        targetId: targetFoundation,
        card,
      })
    }
  }

  return (
    <div className="md:px-8">
      <GameOverModal isGameOver={isGameOver} scores={scores} finalScore={finalScore} drawMode={drawMode}>
        <Button onClick={onNewGame} className="w-full bg-black text-white font-bold hover:bg-zinc-800">
          New Game
        </Button>
      </GameOverModal>
      <p className="flex gap-4 justify-center mb-4">
        <span>Score: {score}</span> <span className="tabular-nums">Duration: {duration}</span>
      </p>
      <div
        className="play-area select-none"
        onClick={(e) => {
          if (e.target.matches('.stock') || e.target.matches('.stock .card')) {
            if (state.stock.length === 0) {
              dispatch({ type: 'reset_waste' })
            } else {
              dispatch({ type: 'draw' })
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
                  })
                }
              } else if (containingPile === 'waste') {
                let card = waste.find((c) => c.id === selectedCard.id)
                let destinationCard = tableaux[id].at(-1)

                if (!isValidTableauMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_waste_to_tableau',
                    targetId: id,
                    card,
                  })
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
                  })
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
                let destinationCard = foundations[id].at(-1)

                if (!isValidFoundationMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_tableau_to_foundation',
                    targetId: id,
                    card,
                  })
                }
              } else if (containingPile === 'waste') {
                let card = waste.find((c) => c.id === selectedCard.id)
                let destinationCard = foundations[id].at(-1)

                if (!isValidFoundationMove(card, destinationCard)) {
                  dispatch({ type: 'invalid_move' })
                } else {
                  dispatch({
                    type: 'move_waste_to_foundation',
                    targetId: id,
                    card,
                  })
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
                  })
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
                        left: `${isTopThree ? (i - waste.length + 3) * 15 : 0}px`,
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
                      style={{ top: `${i * 20}px` }}
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
      className={`${type} relative flex justify-center items-center w-[50px] h-[100px] border-[1px] border-gray-300 rounded-md md:w-[75px] md:h-[125px]`}
      data-pile={type}
    >
      {children}
    </div>
  )
}

export default KlondikeSolitaire
