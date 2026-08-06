function dataIso(valore) {
  if (!valore) return null;

  const data = valore instanceof Date ? valore : new Date(valore);
  return Number.isNaN(data.getTime()) ? null : data.toISOString();
}

function presentaClassifica(classifica) {
  if (!classifica) return null;

  return {
    posizione: classifica.posizione,
    punti: classifica.punti,
    vittorie: classifica.vittorie,
  };
}

function presentaScuderiaBreve(scuderia) {
  if (!scuderia) return null;

  return {
    slug: scuderia.slug,
    nome: scuderia.nome,
  };
}

function presentaPilotaBreve(pilota) {
  if (!pilota) return null;

  return {
    slug: pilota.slug,
    nome: pilota.nome,
    codice: pilota.codice,
    numero: pilota.numero,
  };
}

function presentaPilota(pilota) {
  if (!pilota) return null;

  return {
    ...presentaPilotaBreve(pilota),
    nazionalita: pilota.nazionalita,
    scuderia: presentaScuderiaBreve(pilota.scuderia),
    classifica: presentaClassifica(pilota.classifica2026),
    aggiornatoIl: dataIso(pilota.updatedAt),
  };
}

function presentaScuderia(scuderia) {
  if (!scuderia) return null;

  return {
    slug: scuderia.slug,
    nome: scuderia.nome,
    nomeClassifica: scuderia.nomeClassifica,
    nazionalita: scuderia.nazionalita,
    denominazioniStoriche: scuderia.denominazioniStoriche || {},
    classifica: presentaClassifica(scuderia.classifica2026),
    aggiornatoIl: dataIso(scuderia.updatedAt),
  };
}

function presentaGaraBreve(gara) {
  if (!gara) return null;

  return {
    slug: gara.slug,
    nome: gara.nome,
    circuito: gara.circuito,
    paese: gara.paese,
    stagione: gara.stagione,
    ordineAnalisi: gara.ordineAnalisi,
    stato: "attuale",
  };
}

function presentaGara(gara) {
  if (!gara) return null;

  return {
    ...presentaGaraBreve(gara),
    contestoStorico: gara.contestoStorico,
    pilotiFavoriti: gara.pilotiFavoriti,
    scuderieFavorite: gara.scuderieFavorite,
    outsider: gara.outsider,
    potenzialiDifficolta: gara.potenzialiDifficolta,
    gommeStrategia: gara.gommeStrategia,
    rischi: gara.rischi,
    confidenza: gara.confidenza,
    fonti: [...(gara.fonti || [])],
    aggiornatoIl: dataIso(gara.updatedAt),
  };
}

function presentaStoricoEdizioni(storicoEdizioni) {
  return (storicoEdizioni || []).map((edizione) => ({
    stagione: edizione.stagione,
    posizioneGara: edizione.posizioneGara,
    posizioneQualifica: edizione.posizioneQualifica,
    notaRisultato: edizione.notaRisultato || "",
    passoGara: edizione.passoGara || "",
    gomme: edizione.gomme || "",
    affidabilita: edizione.affidabilita || "",
  }));
}

function presentaAnalisiBase(analisi) {
  if (!analisi) return null;

  return {
    gara: presentaGaraBreve(analisi.gara),
    posizioniStoriche: analisi.posizioniStoriche,
    spiegazionePosizioni: analisi.spiegazionePosizioni,
    qualificheStoriche: analisi.qualificheStoriche,
    prestazioni: {
      passoGara: analisi.passoGara,
      gestioneGomme: analisi.gomme,
      affidabilita: analisi.affidabilita || "",
    },
    considerazioniFinali: analisi.considerazioni,
    aggiornamentiInArrivo: analisi.aggiornamentiInArrivo || "",
    storicoEdizioni: presentaStoricoEdizioni(analisi.storicoEdizioni),
    fonti: [...(analisi.fonti || [])],
    aggiornatoIl: dataIso(analisi.updatedAt),
  };
}

function presentaAnalisiPilota(analisi) {
  if (!analisi) return null;

  return {
    pilota: presentaPilotaBreve(analisi.pilota),
    scuderia: presentaScuderiaBreve(analisi.scuderia),
    ...presentaAnalisiBase(analisi),
  };
}

function presentaAnalisiScuderia(analisi) {
  if (!analisi) return null;

  return {
    scuderia: presentaScuderiaBreve(analisi.scuderia),
    ...presentaAnalisiBase(analisi),
  };
}

function presentaAndamento(andamento) {
  return {
    stagione: andamento.stagione,
    etichette: [...(andamento.etichette || [])],
    qualifica: (andamento.qualifica || []).map((serie) => ({
      nome: serie.nome,
      valori: [...serie.valori],
    })),
    gara: (andamento.gara || []).map((serie) => ({
      nome: serie.nome,
      valori: [...serie.valori],
    })),
  };
}

module.exports = {
  presentaAnalisiPilota,
  presentaAnalisiScuderia,
  presentaAndamento,
  presentaGara,
  presentaGaraBreve,
  presentaPilota,
  presentaPilotaBreve,
  presentaScuderia,
  presentaScuderiaBreve,
};
