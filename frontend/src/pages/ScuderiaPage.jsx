import { useEffect, useState } from 'react'
import { caricaScuderia } from '../services/api.js'
import { Caricamento, ErrorePagina } from '../components/StatoPagina.jsx'
import IntestazioneDettaglio from '../components/IntestazioneDettaglio.jsx'
import AnalisiCircuito from '../components/AnalisiCircuito.jsx'

function ScuderiaPage({ slug }) {
  const [dati, setDati] = useState(null)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    let componenteAttivo = true
    setDati(null)
    setErrore('')

    caricaScuderia(slug)
      .then((risultato) => {
        if (componenteAttivo) {
          setDati(risultato)
        }
      })
      .catch((problema) => {
        if (componenteAttivo) setErrore(problema.message)
      })

    return () => {
      componenteAttivo = false
    }
  }, [slug])

  if (errore) return <ErrorePagina messaggio={errore} />
  if (!dati) return <Caricamento />

  const nomiPiloti = dati.piloti.map((pilota) => pilota.nome).join(' · ')

  return (
    <>
      <IntestazioneDettaglio
        etichetta="Profilo scuderia"
        titolo={dati.scuderia.nome}
        sottotitolo={`${nomiPiloti} · ${dati.scuderia.nazionalita}`}
        sigla={dati.scuderia.nome.slice(0, 3).toUpperCase()}
        statistiche={[
          {
            valore: `P${dati.scuderia.classifica2026.posizione}`,
            etichetta: 'Classifica 2026',
          },
          {
            valore: dati.scuderia.classifica2026.punti,
            etichetta: 'Punti',
          },
        ]}
      />

      <div className="contenitore dettaglio-contenuto">
        <AnalisiCircuito
          analisi={dati.analisi}
          andamentoUltimoAnno={dati.andamentoUltimoAnno}
        />
      </div>
    </>
  )
}

export default ScuderiaPage
