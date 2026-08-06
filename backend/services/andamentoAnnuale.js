const nomiBreviCircuiti = {
  "olanda-zandvoort": "Zandvoort",
  "italia-monza": "Monza",
  "spagna-madring": "Madring",
  "azerbaigian-baku": "Baku",
  "bahrein-sepang": "Sepang",
  "singapore-marina-bay": "Singapore",
  "usa-austin": "Austin",
  "messico-citta-del-messico": "Messico",
  "brasile-interlagos": "Interlagos",
  "usa-las-vegas": "Las Vegas",
  "qatar-lusail": "Lusail",
  "abu-dhabi-yas-marina": "Yas Marina",
};

function rigaDellaStagione(testo, stagione) {
  return String(testo || "")
    .split(/\r?\n/)
    .find((riga) => riga.trim().startsWith(`${stagione}:`));
}

function primaPosizione(testo, stagione, prefisso) {
  const riga = rigaDellaStagione(testo, stagione);
  const posizione = riga?.match(new RegExp(`\\b${prefisso}(\\d+)\\b`, "i"));

  return posizione ? Number(posizione[1]) : null;
}

function posizioniPerCodice(testo, stagione, prefisso) {
  const riga = rigaDellaStagione(testo, stagione);
  const posizioni = new Map();

  if (!riga) return posizioni;

  const espressione = new RegExp(
    `\\b([A-Z]{3})\\s+${prefisso}(\\d+)\\b`,
    "gi",
  );

  for (const corrispondenza of riga.matchAll(espressione)) {
    posizioni.set(corrispondenza[1].toUpperCase(), Number(corrispondenza[2]));
  }

  return posizioni;
}

function posizioneDaEdizione(valore) {
  const posizione = String(valore || "").match(/\b[QP](\d+)\b/i);
  return posizione ? Number(posizione[1]) : null;
}

function posizioniEdizionePerCodice(valore) {
  const posizioni = new Map();
  const espressione = /\b([A-Z]{3})\s+[QP](\d+)\b/gi;

  for (const corrispondenza of String(valore || "").matchAll(espressione)) {
    posizioni.set(corrispondenza[1].toUpperCase(), Number(corrispondenza[2]));
  }

  return posizioni;
}

function creaEventiPilota(analisi, stagione, codice) {
  return analisi.map((elemento) => {
    const edizione = elemento.storicoEdizioni?.find(
      (storico) => storico.stagione === stagione,
    );
    const gara = edizione
      ? posizioneDaEdizione(edizione.posizioneGara)
      : primaPosizione(elemento.posizioniStoriche, stagione, "P");
    const qualifica = edizione
      ? posizioneDaEdizione(edizione.posizioneQualifica)
      : primaPosizione(elemento.qualificheStoriche, stagione, "Q");

    return {
      etichetta: nomiBreviCircuiti[elemento.gara.slug] || elemento.gara.circuito,
      gara: new Map([[codice, gara]]),
      qualifica: new Map([[codice, qualifica]]),
    };
  });
}

function creaEventiScuderia(analisi, stagione) {
  return analisi.map((elemento) => {
    const edizione = elemento.storicoEdizioni?.find(
      (storico) => storico.stagione === stagione,
    );

    return {
      etichetta: nomiBreviCircuiti[elemento.gara.slug] || elemento.gara.circuito,
      gara: edizione
        ? posizioniEdizionePerCodice(edizione.posizioneGara)
        : posizioniPerCodice(elemento.posizioniStoriche, stagione, "P"),
      qualifica: edizione
        ? posizioniEdizionePerCodice(edizione.posizioneQualifica)
        : posizioniPerCodice(elemento.qualificheStoriche, stagione, "Q"),
    };
  });
}

function creaSerie(eventi, codici, tipo) {
  return codici.map((codice) => ({
    nome: codice,
    valori: eventi.map((evento) => evento[tipo].get(codice) ?? null),
  }));
}

function trovaStagionePiuRecente(analisi, stagioneMassima) {
  const stagioni = new Set();

  analisi.forEach((elemento) => {
    (elemento.storicoEdizioni || []).forEach((edizione) => {
      if (Number.isInteger(edizione.stagione)) {
        stagioni.add(edizione.stagione);
      }
    });

    for (const testo of [
      elemento.posizioniStoriche,
      elemento.qualificheStoriche,
    ]) {
      const espressioneStagione = /(?:^|\n)(\d{4})\s*:/g;
      for (const corrispondenza of String(testo || "").matchAll(
        espressioneStagione,
      )) {
        stagioni.add(Number(corrispondenza[1]));
      }
    }
  });

  const disponibili = [...stagioni]
    .filter((stagione) => stagione <= stagioneMassima)
    .sort((prima, seconda) => seconda - prima);

  return disponibili[0] || stagioneMassima - 1;
}

function creaAndamentoAnnuale({ analisi, stagione, codicePilota = null }) {
  const analisiOrdinate = [...analisi].sort(
    (prima, seconda) => prima.gara.ordineAnalisi - seconda.gara.ordineAnalisi,
  );
  const eventiCompleti = codicePilota
    ? creaEventiPilota(analisiOrdinate, stagione, codicePilota)
    : creaEventiScuderia(analisiOrdinate, stagione);
  const eventi = eventiCompleti.filter(
    (evento) =>
      evento.gara.size > 0 &&
      [...evento.gara.values()].some(Number.isFinite),
  );
  const codici = codicePilota
    ? [codicePilota]
    : [
        ...new Set(
          eventi.flatMap((evento) => [
            ...evento.gara.keys(),
            ...evento.qualifica.keys(),
          ]),
        ),
      ];

  return {
    stagione,
    etichette: eventi.map((evento) => evento.etichetta),
    qualifica: creaSerie(eventi, codici, "qualifica"),
    gara: creaSerie(eventi, codici, "gara"),
  };
}

module.exports = creaAndamentoAnnuale;
module.exports.trovaStagionePiuRecente = trovaStagionePiuRecente;
