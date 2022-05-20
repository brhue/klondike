import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'

export default function GameOverModal({ children, isGameOver, scores, finalScore, drawMode }) {
  return (
    <Dialog
      isOpen={isGameOver}
      aria-label="Game over window"
      className="border-2 border-black rounded w-full md:w-1/2 mt-4 p-4 dark:bg-zinc-800"
    >
      <div className="space-y-4">
        <h1 className="text-center font-bold text-2xl">You win!</h1>
        <h2 className="font-bold text-center text-xl">Final score: {finalScore}</h2>

        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">
              {drawMode === 1 ? scores.drawOne.gamesPlayed : scores.drawThree.gamesPlayed}
            </span>
            <span>Played</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">
              {drawMode === 1 ? scores.drawOne.gamesWon : scores.drawThree.gamesWon}
            </span>
            <span>Won</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-bold text-lg">
              {drawMode === 1 ? scores.drawOne.bestScore : scores.drawThree.bestScore}
            </span>
            <span>Best Score</span>
          </div>
        </div>
        <h2 className="font-bold text-center text-2xl">Last 10 Games</h2>
        <table className="w-full text-center">
          <thead>
            <tr>
              <th>Score</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {drawMode === 1
              ? scores.drawOne.scores.map((score, i) => {
                  return (
                    <tr key={i}>
                      <td>{score.score}</td>
                      <td>{score.duration}</td>
                      <td>{new Date(score.date).toLocaleString()}</td>
                    </tr>
                  )
                })
              : scores.drawThree.scores.map((score, i) => {
                  return (
                    <tr key={i}>
                      <td>{score.score}</td>
                      <td>{score.duration}</td>
                      <td>{new Date(score.date).toLocaleString()}</td>
                    </tr>
                  )
                })}
          </tbody>
        </table>
        <p>{children}</p>
      </div>
    </Dialog>
  )
}
