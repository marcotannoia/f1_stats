import Collegamento from '../components/Collegamento.jsx'

function PaginaNonTrovata() {
  return (
    <section className="stato-pagina">
      <span className="etichetta">Errore 404</span>
      <h1>Pagina non trovata.</h1>
      <p>L’indirizzo richiesto non corrisponde a un profilo disponibile.</p>
      <Collegamento a="/" className="bottone bottone-rosso">
        Torna alla ricerca
      </Collegamento>
    </section>
  )
}

export default PaginaNonTrovata
