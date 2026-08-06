import GraficoAndamento from './GraficoAndamento.jsx'

function pulisciProsa(testo) {
  return String(testo || '')
    .replace(/\s*[•·]\s*/g, ', ')
    .replace(/\s*\r?\n\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function normalizzaQualifica(testo) {
  return String(testo || '').replace(/\bQ(?=\d)/gi, 'P')
}

function estraiPosizione(contenuto, tipo) {
  if (/NON CORSO/i.test(contenuto)) return 'Non corso'

  const prefisso = tipo === 'gara' ? 'P' : 'Q'
  const espressione = new RegExp(
    `(?:\\b[A-Z]{3}\\s+)?${prefisso}\\d+\\b|\\b(?:DNF|DNS|DSQ|NC)\\b`,
    'g',
  )
  const posizioni = contenuto.toUpperCase().match(espressione)
  const risultato = posizioni?.join(' / ') || '—'

  return tipo === 'qualifica' ? normalizzaQualifica(risultato) : risultato
}

function leggiStorico(testo, tipo, edizioni = []) {
  const righe = String(testo || '')
    .split(/\r?\n/)
    .map((riga) => riga.trim())
    .filter(Boolean)
    .map((riga) => {
      const corrispondenza = riga.match(/^(\d{4})\s*:\s*(.*)$/)
      if (!corrispondenza) return null

      return {
        anno: Number(corrispondenza[1]),
        posizione: estraiPosizione(corrispondenza[2], tipo),
      }
    })
    .filter(Boolean)

  edizioni.forEach((edizione) => {
    const campo = tipo === 'gara' ? 'posizioneGara' : 'posizioneQualifica'
    let posizione = edizione[campo]

    if (!posizione) return
    if (tipo === 'qualifica') posizione = normalizzaQualifica(posizione)

    const indice = righe.findIndex((riga) => riga.anno === edizione.stagione)
    const nuovaRiga = { anno: edizione.stagione, posizione }

    if (indice >= 0) righe[indice] = nuovaRiga
    else righe.push(nuovaRiga)
  })

  return righe.sort((prima, seconda) => prima.anno - seconda.anno)
}

function leggiTestiAnnuali(testo) {
  const testi = new Map()
  const espressione = /(?:^|\s)(\d{4})\s*:\s*([\s\S]*?)(?=\s+\d{4}\s*:|$)/g

  for (const corrispondenza of String(testo || '').matchAll(espressione)) {
    testi.set(Number(corrispondenza[1]), pulisciProsa(corrispondenza[2]))
  }

  return testi
}

function creaNoteAnnuali(analisi, anni) {
  const notePerAnno = leggiTestiAnnuali(analisi.spiegazionePosizioni)
  const notaGenerale = notePerAnno.size
    ? ''
    : pulisciProsa(analisi.spiegazionePosizioni)
  const storicoEdizioni = analisi.storicoEdizioni || []

  storicoEdizioni.forEach((edizione) => {
    if (edizione.notaRisultato) {
      notePerAnno.set(edizione.stagione, pulisciProsa(edizione.notaRisultato))
    }
  })

  return anni.map((anno) => ({
    etichetta: String(anno),
    testo:
      notePerAnno.get(anno) ||
      notaGenerale ||
      'Nessun elemento atipico specifico è indicato nei dati disponibili.',
  }))
}

function creaAndamentoAnnuale(storicoGara, storicoQualifica, noteAnnuali) {
  const notePerAnno = new Map(
    noteAnnuali.map((nota) => [Number(nota.etichetta), nota.testo]),
  )

  return storicoGara.map((gara) => {
    const qualifica = storicoQualifica.find((riga) => riga.anno === gara.anno)
    const posizioneQualifica = qualifica?.posizione || '—'
    const nonDisputata =
      gara.posizione === 'Non corso' && posizioneQualifica === 'Non corso'

    const andamento = nonDisputata
      ? 'Non ha disputato il Gran Premio di Formula 1.'
      : `In qualifica: ${posizioneQualifica}; in gara: ${gara.posizione}.`

    return {
      etichetta: String(gara.anno),
      testo: `${andamento} ${notePerAnno.get(gara.anno) || ''}`.trim(),
    }
  })
}

function aggiungiRiga(righe, etichetta, testo) {
  const contenuto = pulisciProsa(testo)
  if (!contenuto) return

  const esistente = righe.find((riga) => riga.etichetta === etichetta)

  if (esistente) esistente.testo = `${esistente.testo} ${contenuto}`
  else righe.push({ etichetta, testo: contenuto })
}

function segmentaPassoGara(testo, edizioni = []) {
  const righe = []
  const frasi = pulisciProsa(testo).split(/(?<=[.!?])\s+/).filter(Boolean)

  frasi.forEach((frase) => {
    const etichettaEsplicita = frase.match(
      /^(Storico|Lettura|Riferimento\s+20\d{2}|20\d{2})\s*:\s*(.*)$/i,
    )

    if (etichettaEsplicita) {
      aggiungiRiga(righe, etichettaEsplicita[1], etichettaEsplicita[2])
      return
    }

    const anno = frase.match(/\b(20\d{2})\b/)?.[1]
    if (anno) aggiungiRiga(righe, anno, frase)
    else if (righe.length) righe[righe.length - 1].testo += ` ${frase}`
    else aggiungiRiga(righe, 'Lettura', frase)
  })

  edizioni.forEach((edizione) => {
    if (edizione.passoGara) {
      aggiungiRiga(righe, String(edizione.stagione), edizione.passoGara)
    }
  })

  return righe
}

function segmentaGestioneGomme(testo, edizioni = []) {
  const righe = []
  const contenuto = pulisciProsa(testo)
  const indicatore2026 = contenuto.match(/Contesto 2026(?: della scuderia)?\s*:/i)

  if (indicatore2026) {
    aggiungiRiga(righe, 'Lettura', contenuto.slice(0, indicatore2026.index))
    aggiungiRiga(
      righe,
      '2026',
      contenuto.slice(indicatore2026.index + indicatore2026[0].length),
    )
  } else {
    aggiungiRiga(righe, 'Lettura', contenuto)
  }

  edizioni.forEach((edizione) => {
    if (edizione.gomme) {
      aggiungiRiga(righe, String(edizione.stagione), edizione.gomme)
    }
  })

  return righe
}

function trovaAffidabilita(analisi) {
  if (analisi.affidabilita) return pulisciProsa(analisi.affidabilita)

  const ultimaAffidabilita = [...(analisi.storicoEdizioni || [])]
    .reverse()
    .find((edizione) => edizione.affidabilita)?.affidabilita

  if (ultimaAffidabilita) return pulisciProsa(ultimaAffidabilita)

  const ritiri = String(analisi.passoGara || '').match(/(\d+)\s+ritiri?\/DNS/i)

  if (ritiri && Number(ritiri[1]) > 0) {
    return `I dati della stagione indicano ${ritiri[1]} ritiri o mancate partenze, quindi l'affidabilità resta un fattore da considerare.`
  }

  if (/\britir(?:o|i|ato|ata)\b|\bDNS\b/i.test(analisi.spiegazionePosizioni || '')) {
    return 'Lo storico del circuito comprende ritiri o gare non completate; questi episodi devono essere separati dal passo prestazionale puro.'
  }

  return ''
}

function segmentaConsiderazioni(analisi) {
  const righe = []
  const frasi = pulisciProsa(analisi.considerazioni)
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)

  frasi.forEach((frase, indice) => {
    let corrispondenza

    if (indice === 0) {
      aggiungiRiga(righe, 'Valutazione', frase)
    } else if ((corrispondenza = frase.match(/^Forma 2026\s*:\s*(.*)$/i))) {
      aggiungiRiga(righe, 'Forma 2026', corrispondenza[1])
    } else if ((corrispondenza = frase.match(/^Riferimento 2026\s*:\s*(.*)$/i))) {
      aggiungiRiga(righe, '2026', corrispondenza[1])
    } else if ((corrispondenza = frase.match(/^Fit pista\s*:\s*(.*)$/i))) {
      aggiungiRiga(righe, 'Circuito', corrispondenza[1])
    } else if (/^Il circuito\b/i.test(frase)) {
      aggiungiRiga(righe, 'Circuito', frase)
    } else if ((corrispondenza = frase.match(/^Confidenza\s*([^.:]*)[.:]?\s*(.*)$/i))) {
      const livello = corrispondenza[1].trim()
      const spiegazione = corrispondenza[2].trim()
      aggiungiRiga(
        righe,
        'Confidenza',
        [livello, spiegazione].filter(Boolean).join(': '),
      )
    } else if (/\b2026\b/.test(frase)) {
      aggiungiRiga(righe, '2026', frase)
    } else if (righe.length) {
      righe[righe.length - 1].testo += ` ${frase}`
    } else {
      aggiungiRiga(righe, 'Analisi', frase)
    }
  })

  aggiungiRiga(righe, 'Affidabilità', trovaAffidabilita(analisi))

  return righe
}

function RisultatiStorici({ titolo, righe }) {
  return (
    <article className="colonna-risultati">
      <h3>{titolo}</h3>
      <div>
        {righe.map((riga) => (
          <p key={`${titolo}-${riga.anno}`}>
            <span>{riga.anno}</span>
            <strong>{riga.posizione}</strong>
          </p>
        ))}
      </div>
    </article>
  )
}

function RigheEtichettate({ righe, classe = '' }) {
  return (
    <div className={`righe-etichettate ${classe}`.trim()}>
      {righe.map((riga, indice) => (
        <div
          className="riga-etichettata"
          key={`${riga.etichetta}-${indice}`}
        >
          <span>{riga.etichetta}</span>
          <p>{riga.testo}</p>
        </div>
      ))}
    </div>
  )
}

function separaNotazioni(testo) {
  return String(testo || '')
    .split(/[;,](?=\s)/)
    .map((voce) => voce.trim().replace(/[.;]+$/, ''))
    .filter(Boolean)
}

function RighePassoGara({ righe }) {
  return (
    <div className="righe-etichettate righe-passo-gara">
      {righe.map((riga, indice) => {
        const notazioni = separaNotazioni(riga.testo)

        return (
          <div
            className="riga-etichettata"
            key={`${riga.etichetta}-${indice}`}
          >
            <span>{riga.etichetta}</span>
            {notazioni.length > 1 ? (
              <ul className="elenco-notazioni">
                {notazioni.map((notazione) => (
                  <li key={notazione}>{notazione}</li>
                ))}
              </ul>
            ) : (
              <p>{riga.testo}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AnalisiCircuito({ analisi, andamentoUltimoAnno }) {
  if (!analisi) {
    return (
      <section className="analisi-non-disponibile">
        <span className="sovratitolo">Circuito attuale</span>
        <h2>Analisi in preparazione</h2>
        <p>I dati del Gran Premio attuale saranno pubblicati qui.</p>
      </section>
    )
  }

  const storicoGara = leggiStorico(
    analisi.posizioniStoriche,
    'gara',
    analisi.storicoEdizioni,
  )
  const storicoQualifica = leggiStorico(
    analisi.qualificheStoriche,
    'qualifica',
    analisi.storicoEdizioni,
  )
  const anni = [...new Set([...storicoGara, ...storicoQualifica].map((riga) => riga.anno))]
  const noteAnnuali = creaNoteAnnuali(analisi, anni)
  const andamentoAnnuale = creaAndamentoAnnuale(
    storicoGara,
    storicoQualifica,
    noteAnnuali,
  )

  return (
    <>
      <section className="introduzione-circuito">
        <span className="sovratitolo">Circuito attuale</span>
        <h2>{analisi.gara.nome}</h2>
        <p>
          {analisi.gara.circuito} · {analisi.gara.paese}
        </p>
      </section>

      <section className="sezione-analisi storico-circuito">
        <div className="intestazione-sezione">
          <span>01</span>
          <div>
            <p>Storico essenziale</p>
            <h2>Risultati sul circuito</h2>
          </div>
        </div>

        <div className="griglia-risultati-storici">
          <RisultatiStorici titolo="Gara" righe={storicoGara} />
          <RisultatiStorici titolo="Qualifica" righe={storicoQualifica} />
        </div>

        <aside className="nota-bene">
          <h3>N.B.</h3>
          <RigheEtichettate righe={noteAnnuali} />
        </aside>
      </section>

      <section className="sezione-analisi performance-circuito">
        <div className="intestazione-sezione">
          <span>02</span>
          <div>
            <p>Lettura storica</p>
            <h2>Prestazioni e performance</h2>
          </div>
        </div>

        <div className="blocchi-performance">
          <article className="blocco-performance">
            <h3>Andamento per anno</h3>
            <RigheEtichettate righe={andamentoAnnuale} />
          </article>

          <article className="blocco-performance">
            <h3>Gestione gomme</h3>
            <RigheEtichettate
              righe={segmentaGestioneGomme(
                analisi.gomme,
                analisi.storicoEdizioni,
              )}
            />
          </article>

          <article className="blocco-performance">
            <h3>Passo gara</h3>
            <RighePassoGara
              righe={segmentaPassoGara(
                analisi.passoGara,
                analisi.storicoEdizioni,
              )}
            />
          </article>
        </div>
      </section>

      <section className="sezione-analisi considerazioni-finali">
        <div className="intestazione-sezione">
          <span>03</span>
          <div>
            <p>Sintesi</p>
            <h2>Considerazioni finali</h2>
          </div>
        </div>
        <RigheEtichettate
          righe={segmentaConsiderazioni(analisi)}
          classe="righe-finali"
        />
      </section>

      <section className="sezione-analisi aggiornamenti-futuri">
        <div className="intestazione-sezione">
          <span>04</span>
          <div>
            <p>Da compilare</p>
            <h2>Aggiornamenti in arrivo</h2>
          </div>
        </div>
        <div className="spazio-aggiornamenti" aria-label="Sezione vuota">
          {analisi.aggiornamentiInArrivo || null}
        </div>
      </section>

      {andamentoUltimoAnno?.etichette?.length > 0 && (
        <section id="andamento" className="sezione-analisi sezione-grafici">
          <div className="intestazione-sezione">
            <span>05</span>
            <div>
              <p>Gran Premio dopo Gran Premio</p>
              <h2>Andamento {andamentoUltimoAnno.stagione}</h2>
            </div>
          </div>

          <div className="griglia-grafici">
            <GraficoAndamento
              titolo="Andamento in qualifica"
              descrizione="Posizione ottenuta nelle qualifiche dell’ultima stagione disponibile."
              etichette={andamentoUltimoAnno.etichette}
              serie={andamentoUltimoAnno.qualifica}
            />
            <GraficoAndamento
              titolo="Andamento in gara"
              descrizione="Posizione finale registrata in ogni Gran Premio disputato."
              etichette={andamentoUltimoAnno.etichette}
              serie={andamentoUltimoAnno.gara}
            />
          </div>
        </section>
      )}

      {analisi.fonti?.length > 0 && (
        <details className="fonti">
          <summary>Fonti consultate</summary>
          <ul>
            {analisi.fonti.map((fonte) => (
              <li key={fonte}>
                <a href={fonte} target="_blank" rel="noreferrer">
                  {fonte}
                </a>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}

export default AnalisiCircuito
