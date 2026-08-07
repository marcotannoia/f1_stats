import Collegamento from './Collegamento.jsx'

export function Caricamento() {
  return (
    <div className="stato-pagina" role="status">
      <span className="indicatore-caricamento" aria-hidden="true" />
      <p>Caricamento dei dati…</p>
    </div>
  )
}

export function ErrorePagina({ messaggio }) {
  return (
    <div className="stato-pagina stato-errore" role="alert">
      <span className="etichetta">Connessione non disponibile</span>
      <h1>Non riesco a leggere i dati.</h1>
      <p>{messaggio}</p>
      {import.meta.env.DEV && (
        <p className="testo-secondario">
          Verifica che il backend locale sia avviato.
        </p>
      )}
      <Collegamento a="/" className="bottone bottone-rosso">
        Torna alla home
      </Collegamento>
    </div>
  )
}
