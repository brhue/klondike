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

function Card({ rank, suit, style }) {
  return (
    <div
      style={{
        ...style,
        position: 'absolute',
        width: '75px',
        height: '125px',
        borderRadius: '4px',
        border: '1px solid black',
        backgroundColor: 'white',
        color: suit === suits.spade || suit === suits.club ? 'black' : 'red',
      }}
    >
      {rank} of {suit}
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
    }

    state.stock = deck
    return state
  })

  let { stock, waste, foundations, tableaux } = gameState

  return (
    <>
      <h1>Solitaire</h1>
      <div className="play-area" style={{ userSelect: 'none' }}>
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
                return <Card rank={card.rank} suit={card.suit} key={card.id} />
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
                return <Card rank={card.rank} suit={card.suit} key={card.id} />
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
                  key={i}
                  style={{
                    border: '1px solid gray',
                    width: '75px',
                    height: '125px',
                  }}
                >
                  {foundation.map((card) => {
                    return <Card rank={card.rank} suit={card.suit} key={card.id} />
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
                style={{
                  width: '75px',
                  height: '125px',
                  position: 'relative',
                }}
              >
                {tableau.map((card, i) => {
                  return <Card rank={card.rank} suit={card.suit} key={card.id} style={{ top: `${i * 10}px` }} />
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
