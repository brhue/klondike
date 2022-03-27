import { useState, useEffect } from 'react'
import KlondikeSolitaire from './KlondikeSolitaire'
import { useLocalStorage } from './utils/hooks'

function App() {
  let [scores, setScores] = useLocalStorage('klondike:scores', {
    drawOne: [],
    drawThree: [],
  })
  let [version, setVersion] = useState(0)

  const reset = () => setVersion((v) => v + 1)
  const addScore = (score) =>
    setScores((s) => {
      return score.drawMode === 1
        ? {
            ...s,
            drawOne: [score, ...s.drawOne.slice(-9)],
          }
        : {
            ...s,
            drawThree: [score, ...s.drawThree.slice(-9)],
          }
    })
  return <KlondikeSolitaire key={version} updateScores={addScore} scores={scores} onNewGame={reset} />
}

export default App
