import { useState, useEffect } from 'react'
import KlondikeSolitaire from './KlondikeSolitaire'
import { useLocalStorage } from './utils/hooks'
import Button from './Button'
import ReloadPrompt from './ReloadPrompt'
import { StatisticsScreen } from './StatisticsScreen'

function App() {
  let [scores, setScores] = useLocalStorage('klondike:scores', {
    drawOne: {
      scores: [],
      bestScore: null,
      gamesPlayed: 0,
      gamesWon: 0,
    },
    drawThree: {
      scores: [],
      bestScore: null,
      gamesPlayed: 0,
      gamesWon: 0,
    },
  })
  // Check for old version of statistics that only stored the last 10 wins
  if (Array.isArray(scores.drawOne)) {
    let newStats = {
      drawOne: {
        scores: [...scores.drawOne],
        gamesPlayed: scores.drawOne.length,
        gamesWon: scores.drawOne.length,
        bestScore: Math.max(...scores.drawOne.map((score) => score.score)),
      },
      drawThree: {
        scores: [...scores.drawThree],
        gamesPlayed: scores.drawThree.length,
        gamesWon: scores.drawThree.length,
        bestScore: Math.max(...scores.drawThree.map((score) => score.score)),
      },
    }
    setScores(newStats)
  }
  let [settings, setSettings] = useLocalStorage('klondike:settings', {
    drawMode: 3,
  })
  let [savedGame, setSavedGame] = useLocalStorage('klondike:savedGame', null)
  let [version, setVersion] = useState(0)

  let [showStats, setShowStats] = useState(false)

  const openStatsScreen = () => setShowStats(true)
  const closeStatsScreen = () => setShowStats(false)

  const reset = async (cb) => {
    if (cb && typeof cb === 'function') await cb()
    setSavedGame(null)
    setVersion((v) => v + 1)
  }
  const addScore = (newScore) =>
    setScores((s) => {
      return newScore.drawMode === 1
        ? {
            ...s,
            drawOne: {
              scores: [newScore, ...s.drawOne.scores.slice(0, 9)],
              gamesPlayed: s.drawOne.gamesPlayed + 1,
              gamesWon: s.drawOne.gamesWon + 1,
              bestScore: newScore.score > s.drawOne.bestScore ? newScore.score : s.drawOne.bestScore,
            },
          }
        : {
            ...s,
            drawThree: {
              scores: [newScore, ...s.drawThree.scores.slice(0, 9)],
              gamesPlayed: s.drawThree.gamesPlayed + 1,
              gamesWon: s.drawThree.gamesWon + 1,
              bestScore: newScore.score > s.drawThree.bestScore ? newScore.score : s.drawThree.bestScore,
            },
          }
    })

  const addGamePlayed = (drawMode) => {
    setScores((s) => {
      return drawMode === 1
        ? {
            ...s,
            drawOne: {
              ...s.drawOne,
              gamesPlayed: s.drawOne.gamesPlayed + 1,
            },
          }
        : {
            ...s,
            drawThree: {
              ...s.drawThree,
              gamesPlayed: s.drawThree.gamesPlayed + 1,
            },
          }
    })
  }
  return (
    <div className="h-full flex flex-col space-y-4 pt-4 max-w-fit mx-auto md:px-8">
      <div className="flex justify-between gap-4 items-center">
        <h1 className="text-center text-3xl">Klondike</h1>
        <button
          className="p-1 rounded hover:bg-zinc-200 hover:dark:bg-zinc-700 active:bg-zinc-300 active:dark:bg-zinc-800"
          onClick={openStatsScreen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path
              fill="currentColor"
              d="M16,11V3H8v6H2v12h20V11H16z M10,5h4v14h-4V5z M4,11h4v8H4V11z M20,19h-4v-6h4V19z"
            ></path>
          </svg>
        </button>
      </div>
      <KlondikeSolitaire
        key={version}
        updateScores={addScore}
        updateGamesPlayed={addGamePlayed}
        scores={scores}
        onNewGame={reset}
        initialDrawMode={settings.drawMode}
        savedState={savedGame}
        updateSavedState={setSavedGame}
        setSettings={setSettings}
      />
      <StatisticsScreen isOpen={showStats} scores={scores} close={closeStatsScreen} />
      <ReloadPrompt />
    </div>
  )
}

export default App
