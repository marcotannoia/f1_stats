import { useEffect, useState } from 'react'

function usePercorso() {
  const [percorso, setPercorso] = useState(window.location.pathname)

  useEffect(() => {
    function aggiornaPercorso() {
      setPercorso(window.location.pathname)
    }

    window.addEventListener('popstate', aggiornaPercorso)

    return () => window.removeEventListener('popstate', aggiornaPercorso)
  }, [])

  return percorso
}

export default usePercorso
