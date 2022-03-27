import { useState, useEffect } from 'react'
import KlondikeSolitaire from './KlondikeSolitaire'
import { useLocalStorage } from './utils/hooks'
import Button from './Button'

function App() {
  let [scores, setScores] = useLocalStorage('klondike:scores', {
    drawOne: [],
    drawThree: [],
  })
  let [settings, setSettings] = useLocalStorage('klondike:settings', {
    drawMode: 3,
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
  return (
    <>
      <h1 className="text-center text-2xl">Klondike</h1>
      <div className="flex justify-center gap-4 mb-4">
        <Button onClick={reset} className="bg-black hover:bg-zinc-800 text-white font-bold">
          New Game
        </Button>
        <Button
          onClick={(e) => {
            setSettings((s) => {
              return { ...s, drawMode: 1 }
            })
            reset()
          }}
          disabled={settings.drawMode === 1}
        >
          Draw 1
        </Button>
        <Button
          onClick={(e) => {
            setSettings((s) => {
              return { ...s, drawMode: 3 }
            })
            reset()
          }}
          disabled={settings.drawMode === 3}
        >
          Draw 3
        </Button>
      </div>
      <KlondikeSolitaire
        key={version}
        updateScores={addScore}
        scores={scores}
        onNewGame={reset}
        initialDrawMode={settings.drawMode}
      />
    </>
  )
}

export default App
