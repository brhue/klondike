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
          if (e.target.matches('.tableau') || e.target.matches('.tableau .card')) {
          } else if (e.target.matches('.foundation') || e.target.matches('.foundation .card')) {
            if (selectedCard) {
              let foundationEl = e.target.matches('.card') ? e.target.parentElement : e.target
              let id = Number(foundationEl.id.replace('f', ''))
              setGameState((s) => {
                let tIndex = s.tableaux.findIndex((t) => t.some((c) => c.id === selectedCard))
                let card = s.tableaux[tIndex].find((c) => c.id === selectedCard)
                return {
                  ...s,
                  tableaux: s.tableaux.map((t) => {
                    return t
                      .filter((c) => c.id !== selectedCard)
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
              })
            }
          } else if (e.target.matches('.card')) {
            let cardEl = e.target
            console.log(cardEl)
            setSelectedCard(cardEl.id)
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
                return <Card key={card.id} {...card} />
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
                return <Card key={card.id} {...card} />
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
                    return <Card key={card.id} {...card} />
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
                  let isSelected = card.id === selectedCard
                  return <Card key={card.id} {...card} style={{ top: `${i * 10}px` }} isSelected={isSelected} />
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
