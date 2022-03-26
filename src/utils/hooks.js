import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  let [state, setState] = useState(() => {
    let localState = window.localStorage.getItem(key)
    return localState ? JSON.parse(localState) : initialValue
  })

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(state))
  }, [state])

  return [state, setState]
}
