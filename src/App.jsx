import { useState } from 'react'

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

function Card({ rank, suit, style, faceUp, id, isSelected }) {
  return (
    <div
      className="card"
      id={id}
      style={{
        position: 'absolute',
        width: '75px',
        height: '125px',
        borderRadius: '4px',
        border: isSelected ? '2px solid gold' : '1px solid black',
        backgroundColor: faceUp ? 'white' : 'green',
        color: suit === suits.spade || suit === suits.club ? 'black' : 'red',
        ...style,
      }}
    >
      {faceUp ? `${rank} of ${suit}s` : null}
    </div>
  )
}

function App() {
  const [gameState, setGameState] = useState(() => {
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
  })

  let [selectedCard, setSelectedCard] = useState()

  let { stock, waste, foundations, tableaux } = gameState

  return (
    <>
      <h1>Solitaire</h1>
      <div
        className="play-area"
        style={{ userSelect: 'none' }}
        onClick={(e) => {
          if (e.target.matches('.stock') || e.target.matches('.stock .card')) {
            if (gameState.stock.length === 0) {
              setGameState((s) => {
                return {
                  ...s,
                  stock: s.waste
                    .map((card) => {
                      return {
                        ...card,
                        faceUp: false,
                      }
                    })
                    .reverse(),
                  waste: [],
                }
              })
            } else {
              setGameState((s) => {
                let card = s.stock.at(-1)
                card.faceUp = true
                return {
                  ...s,
                  stock: s.stock.slice(0, s.stock.length - 1),
                  waste: [...s.waste, card],
                }
              })
            }
          } else if (e.target.matches('.tableau') || e.target.matches('.tableau .card')) {
            if (selectedCard) {
              let tableauEl = e.target.matches('.card') ? e.target.parentElement : e.target
              let id = Number(tableauEl.id.replace('t', ''))
              setGameState((s) => {
                let { containingPile } = selectedCard

                if (containingPile === 'tableau') {
                  let tIndex = s.tableaux.findIndex((t) => t.some((c) => c.id === selectedCard.id))
                  let cardIndex = s.tableaux[tIndex].findIndex((c) => c.id === selectedCard.id)
                  let isTopCard = cardIndex === s.tableaux[tIndex].length - 1

                  if (isTopCard) {
                    let card = s.tableaux[tIndex][cardIndex]

                    return {
                      ...s,
                      tableaux: s.tableaux
                        .map((t) => {
                          return t
                            .filter((c) => c.id !== selectedCard.id)
                            .map((c, i, a) => {
                              if (i === a.length - 1) {
                                return { ...c, faceUp: true }
                              }
                              return c
                            })
                        })
                        .map((t, i) => {
                          if (i == id) {
                            return [...t, card]
                          }
                          return t
                        }),
                    }
                  } else {
                    let cards = s.tableaux[tIndex].slice(cardIndex)
                    return {
                      ...s,
                      tableaux: s.tableaux
                        .map((t) => {
                          return t
                            .filter((c) => !cards.includes(c))
                            .map((c, i, a) => {
                              if (i === a.length - 1) {
                                return { ...c, faceUp: true }
                              }
                              return c
                            })
                        })
                        .map((t, i) => {
                          if (i == id) {
                            return [...t, ...cards]
                          }
                          return t
                        }),
                    }
                  }
                } else if (containingPile === 'waste') {
                  let card = s.waste.find((c) => c.id === selectedCard.id)
                  return {
                    ...s,
                    waste: s.waste.filter((c) => c.id !== selectedCard.id),
                    tableaux: s.tableaux.map((t, i) => {
                      if (i == id) {
                        return [...t, card]
                      }
                      return t
                    }),
                  }
                }
              })
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
              setGameState((s) => {
                let { containingPile } = selectedCard
                if (containingPile === 'tableau') {
                  let tIndex = s.tableaux.findIndex((t) => t.some((c) => c.id === selectedCard.id))
                  let card = s.tableaux[tIndex].find((c) => c.id === selectedCard.id)
                  return {
                    ...s,
                    tableaux: s.tableaux.map((t) => {
                      return t
                        .filter((c) => c.id !== selectedCard.id)
                        .map((c, i, a) => {
                          if (i === a.length - 1) {
                            return { ...c, faceUp: true }
                          }
                          return c
                        })
                    }),
                    foundations: s.foundations.map((f, i) => {
                      if (i === id) {
                        return [...f, card]
                      }
                      return f
                    }),
                  }
                } else if (containingPile === 'waste') {
                  let card = s.waste.find((c) => c.id === selectedCard.id)
                  return {
                    ...s,
                    waste: s.waste.filter((c) => c.id !== selectedCard.id),
                    foundations: s.foundations.map((f, i) => {
                      if (i === id) {
                        return [...f, card]
                      }
                      return f
                    }),
                  }
                }
              })
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
          }}
        >
          <div
            className="stock-waste"
            style={{
              display: 'flex',
              gap: '1rem',
            }}
          >
            <div
              className="stock"
              style={{
                width: '75px',
                height: '125px',
                position: 'relative',
              }}
            >
              {stock.map((card) => {
                return <Card key={card.id} {...card} isSelected={card.id === selectedCard?.id} />
              })}
            </div>
            <div
              className="waste"
              style={{
                width: '75px',
                height: '125px',
                position: 'relative',
                border: '1px solid gray',
              }}
            >
              {waste.map((card) => {
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
                    width: '75px',
                    height: '125px',
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
                }}
              >
                {tableau.map((card, i) => {
                  let isSelected = card.id === selectedCard?.id
                  return <Card key={card.id} {...card} style={{ top: `${i * 15}px` }} isSelected={isSelected} />
                })}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default App
