import { useEffect, useState } from 'react'
import { caricaPilota } from '../services/api.js'
import { Caricamento, ErrorePagina } from '../components/StatoPagina.jsx'
import IntestazioneDettaglio from '../components/IntestazioneDettaglio.jsx'
import AnalisiCircuito from '../components/AnalisiCircuito.jsx'

function PilotaPage({ slug }) {
  const [dati, setDati] = useState(null)
  const [errore, setErrore] = useState('')

  useEffect(() => {
    let componenteAttivo = true
    setDati(null)
    setErrore('')

    caricaPilota(slug)
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

  return (
    <>
      <IntestazioneDettaglio
        etichetta="Profilo pilota"
        titolo={dati.pilota.nome}
        sottotitolo={`${dati.pilota.scuderia.nome} · #${dati.pilota.numero} · ${dati.pilota.nazionalita}`}
        sigla={dati.pilota.codice}
        statistiche={[
          {
            valore: `P${dati.pilota.classifica2026.posizione}`,
            etichetta: 'Classifica 2026',
          },
          {
            valore: dati.pilota.classifica2026.punti,
            etichetta: 'Punti',
          },
        ]}
      />

      <div className="contenitore dettaglio-contenuto">
        <AnalisiCircuito
          analisi={dati.analisi}
          andamentoStagioneCorrente={dati.andamentoStagioneCorrente}
        />
      </div>
    </>
  )
}

export default PilotaPage
