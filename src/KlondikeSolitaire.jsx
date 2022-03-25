import { useReducer, useState } from 'react'
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
      className="card"
      id={id}
      style={{
        position: 'absolute',
        width: '75px',
        height: '125px',
        padding: '2px',
        borderRadius: '4px',
        border: isSelected ? '2px solid gold' : '1px solid black',
        backgroundColor: faceUp ? 'white' : 'green',
        color: suit === suits.spade || suit === suits.club ? 'black' : 'red',
        ...style,
      }}
      onDoubleClick={() => {
        handleDoubleClick({
          rank,
          suit,
          faceUp,
          id,
        })
      }}
    >
      {faceUp ? `${rankSymbol} ${suitSymnbol}` : null}
    </div>
  )
}

function createInitialState() {
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
    drawMode: 3,
    score: 0,
    foundations: [[], [], [], []],
    waste: [],
    tableaux: [],
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
  }
  throw Error('Unknown action: ' + action.type)
}

function KlondikeSolitaire() {
  let [state, dispatch] = useReducer(klondikeReducer, null, createInitialState)

  let [selectedCard, setSelectedCard] = useState()

  let { score, stock, waste, foundations, tableaux, drawMode } = state

  function handleCardDoubleClick(card) {
    if (!card.faceUp) return
    let targetFoundation
    if (card.rank === 'ace') {
      targetFoundation = foundations.findIndex((f) => f.length === 0)
    } else {
      targetFoundation = foundations.findIndex((f) => f.some((c) => isValidFoundationMove(card, c)))
    }
    if (targetFoundation === -1) {
      dispatch({ type: 'invalid_move' })
    } else {
      dispatch({
        type: 'move_tableau_to_foundation',
        targetId: targetFoundation,
        card,
      })
    }
  }

  return (
    <div
      style={{
        marginLeft: '2rem',
      }}
    >
      <h1>Solitaire</h1>
      <h2>Score: {score} points</h2>
      <p>
        <button
          onClick={(e) => {
            dispatch({ type: 'change_draw_mode', value: 1 })
          }}
          disabled={drawMode === 1}
        >
          Draw 1
        </button>
        <button
          onClick={(e) => {
            dispatch({ type: 'change_draw_mode', value: 3 })
          }}
          disabled={drawMode === 3}
        >
          Draw 3
        </button>
      </p>
      <div
        className="play-area"
        style={{ userSelect: 'none' }}
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
                setSelectedCard({ id: e.target.id, containingPile: e.target.parentElement.className })
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
                setSelectedCard({ id: e.target.id, containingPile: e.target.parentElement.className })
              }
            }
          } else if (e.target.matches('.card')) {
            setSelectedCard({ id: e.target.id, containingPile: e.target.parentElement.className })
          } else {
            setSelectedCard(null)
          }
        }}
      >
        <div
          className="upper-area"
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          <div
            className="stock-waste"
            style={{
              display: 'flex',
              gap: '1rem',
              marginRight: 'calc(1rem + 75px)',
            }}
          >
            <div
              className="stock"
              style={{
                width: '75px',
                height: '125px',
                position: 'relative',
                border: '1px solid gray',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {stock.length ? (
                stock.map((card) => {
                  return <Card key={card.id} {...card} isSelected={card.id === selectedCard?.id} />
                })
              ) : (
                <p>Reset</p>
              )}
            </div>
            <div
              className="waste"
              style={{
                width: '75px',
                height: '125px',
                position: 'relative',
                border: '1px solid gray',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {waste.map((card, i) => {
                if (drawMode === 3) {
                  let isTopThree = waste.length - i < 3
                  return (
                    <Card
                      key={card.id}
                      {...card}
                      isSelected={card.id === selectedCard?.id}
                      style={{
                        left: `${isTopThree ? (i - waste.length + 3) * 15 : 0}px`,
                      }}
                    />
                  )
                }
                return <Card key={card.id} {...card} isSelected={card.id === selectedCard?.id} />
              })}
            </div>
          </div>
          <div
            className="foundations"
            style={{
              display: 'flex',
              gap: '1rem',
            }}
          >
            {foundations.map((foundation, i) => {
              return (
                <div
                  className="foundation"
                  id={'f' + i}
                  key={i}
                  style={{
                    border: '1px solid gray',
                    borderRadius: '4px',
                    width: '75px',
                    height: '125px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {foundation.map((card) => {
                    return <Card key={card.id} {...card} isSelected={card.id === selectedCard?.id} />
                  })}
                </div>
              )
            })}
          </div>
        </div>
        <div
          className="tableaux"
          style={{
            display: 'flex',
            gap: '1rem',
          }}
        >
          {tableaux.map((tableau, i) => {
            return (
              <div
                key={i}
                id={`t${i}`}
                className="tableau"
                style={{
                  width: '75px',
                  height: '125px',
                  position: 'relative',
                  border: '1px solid gray',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
              >
                {tableau.map((card, i) => {
                  let isSelected = card.id === selectedCard?.id
                  return (
                    <Card
                      key={card.id}
                      {...card}
                      style={{ top: `${i * 20}px` }}
                      isSelected={isSelected}
                      handleDoubleClick={handleCardDoubleClick}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default KlondikeSolitaire