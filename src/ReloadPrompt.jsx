import { useRegisterSW } from 'virtual:pwa-register/react'
import Alert from '@reach/alert'
import Portal from '@reach/portal'
import Button from './Button'

function ReloadPrompt() {
  let {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.log(`SW registration error ${error}`)
    },
    onRegistered(r) {
      console.log('SW registered: ', r)
    },
  })
  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <Portal>
      {(offlineReady || needRefresh) && (
        <Alert className="absolute border border-zinc-700 rounded p-4 bottom-4 left-4 right-4 md:right-[unset] dark:bg-zinc-800 shadow-md animate-fade-in">
          <div className="mb-2">
            {offlineReady ? (
              <span>App ready to work offline</span>
            ) : (
              <span>New content available, click on reload button to update.</span>
            )}
          </div>
          {needRefresh && <Button onClick={() => updateServiceWorker(true)}>Reload</Button>}
          <Button onClick={() => close()}>Close</Button>
        </Alert>
      )}
    </Portal>
  )
}

export default ReloadPrompt
