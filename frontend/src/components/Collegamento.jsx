import { vaiA } from '../navigation.js'

function Collegamento({ a, children, ...proprieta }) {
  function naviga(evento) {
    const nuovaScheda =
      evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey

    if (evento.button === 0 && !nuovaScheda) {
      evento.preventDefault()
      vaiA(a)
    }
  }

  return (
    <a href={a} onClick={naviga} {...proprieta}>
      {children}
    </a>
  )
}

export default Collegamento
