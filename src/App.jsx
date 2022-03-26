import { useState, useEffect } from 'react'
import KlondikeSolitaire from './KlondikeSolitaire'
import { useLocalStorage } from './utils/hooks'

function App() {
  let [scores, setScores] = useLocalStorage('klondike:scores', {
    drawOne: [],
    drawThree: [],
  })
  const addScore = (score) =>
    setScores((s) => {
      return score.drawMode === 1
        ? {
            ...s,
            drawOne: [...s.drawOne.slice(-9), score],
          }
        : {
            ...s,
            drawThree: [...s.drawThree.slice(-9), score],
          }
    })
  return <KlondikeSolitaire updateScores={addScore} />
}

export default App
