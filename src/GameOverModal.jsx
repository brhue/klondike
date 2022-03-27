import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'

export default function GameOverModal({ children, isGameOver, scores, finalScore, drawMode }) {
  return (
    <Dialog
      isOpen={isGameOver}
      aria-label="Game over window"
      className="border-2 border-black rounded w-full md:w-1/2 mt-4 p-4"
    >
      <div>
        <h1 className="text-center font-bold text-2xl">You win!</h1>
        <h2 className="font-bold text-center text-xl mb-4">Final score: {finalScore}</h2>
        <h2 className="font-bold text-center text-2xl">Last 10 Games</h2>
        <table className="w-full text-center mb-4">
          <thead>
            <tr>
              <th>Score</th>
              <th>Duration</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {drawMode === 1
              ? scores.drawOne.map((score, i) => {
                  return (
                    <tr key={i}>
                      <td>{score.score}</td>
                      <td>{score.duration}</td>
                      <td>{new Date(score.date).toLocaleString()}</td>
                    </tr>
                  )
                })
              : scores.drawThree.map((score, i) => {
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
