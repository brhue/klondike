import { useState } from 'react'
import Button from './Button'
import { Dialog } from '@reach/dialog'

export function StatisticsScreen({ scores, isOpen, close }) {
  let [drawMode, setDrawMode] = useState(1)

  return (
    <Dialog
      aria-label="Statistics screen"
      isOpen={isOpen}
      onDismiss={close}
      className="border-2 border-black rounded w-full md:w-1/2 mt-4 p-4 dark:bg-zinc-800"
    >
      <div className="space-y-4">
        <h2 className="font-bold text-center text-2xl">Stats</h2>
        <div className="flex justify-center gap-4">
          <Button className="flex-grow" onClick={() => setDrawMode(1)} disabled={drawMode === 1}>
            Draw 1
          </Button>
          <Button className="flex-grow" onClick={() => setDrawMode(3)} disabled={drawMode === 3}>
            Draw 3
          </Button>
        </div>
        <h2 className="font-bold text-center text-xl">Last 10 Games</h2>
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
              : null}
            {drawMode === 3
              ? scores.drawThree.map((score, i) => {
                  return (
                    <tr key={i}>
                      <td>{score.score}</td>
                      <td>{score.duration}</td>
                      <td>{new Date(score.date).toLocaleString()}</td>
                    </tr>
                  )
                })
              : null}
          </tbody>
        </table>
        <Button className="w-full" onClick={close}>
          Close
        </Button>
      </div>
    </Dialog>
  )
}
