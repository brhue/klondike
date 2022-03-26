import { Dialog } from '@reach/dialog'
import '@reach/dialog/styles.css'

export default function GameOverModal({ children, isGameOver, scores, finalScore, drawMode }) {
  return (
    <Dialog isOpen={isGameOver} aria-label="Game over window">
      <div>
        <h3>You win!</h3>
        <h3>Final score is: {finalScore}</h3>
        <ol>
          {drawMode === 1
            ? scores.drawOne.map((score, i) => {
                return (
                  <li key={i}>
                    {score.score} {score.duration} {new Date(score.date).toLocaleString()}
                  </li>
                )
              })
            : scores.drawThree.map((score, i) => {
                return (
                  <li key={i}>
                    {score.score} {score.duration} {new Date(score.date).toLocaleString()}
                  </li>
                )
              })}
        </ol>
        <p>{children}</p>
      </div>
    </Dialog>
  )
}
