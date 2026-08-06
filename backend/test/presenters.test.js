const test = require("node:test");
const assert = require("node:assert/strict");
const {
  presentaAnalisiPilota,
  presentaGara,
  presentaPilota,
} = require("../presenters/apiV1");

test("il presentatore del pilota non espone identificativi MongoDB", () => {
  const pilota = presentaPilota({
    _id: "interno",
    slug: "leclerc",
    nome: "Charles Leclerc",
    codice: "LEC",
    numero: "16",
    nazionalita: "Monegasca",
    scuderia: { _id: "interno", slug: "ferrari", nome: "Ferrari" },
    classifica2026: { posizione: 3, punti: 100, vittorie: 1 },
  });

  assert.equal(pilota.slug, "leclerc");
  assert.deepEqual(pilota.classifica, {
    posizione: 3,
    punti: 100,
    vittorie: 1,
  });
  assert.equal(JSON.stringify(pilota).includes("_id"), false);
  assert.equal("classifica2026" in pilota, false);
});

test("la gara pubblica e sempre marcata come attuale", () => {
  const gara = presentaGara({
    _id: "interno",
    slug: "olanda-zandvoort",
    nome: "Gran Premio d'Olanda",
    circuito: "Zandvoort",
    paese: "Olanda",
    stagione: 2026,
    ordineAnalisi: 1,
    stato: "prossima",
    etichettaExcel: "CAMPO INTERNO",
    contestoStorico: "Contesto",
    pilotiFavoriti: "Piloti",
    scuderieFavorite: "Scuderie",
    outsider: "Outsider",
    potenzialiDifficolta: "Difficolta",
    gommeStrategia: "Gomme",
    rischi: "Rischi",
    confidenza: "Media",
    fonti: [],
  });

  assert.equal(gara.stato, "attuale");
  assert.equal("etichettaExcel" in gara, false);
  assert.equal(JSON.stringify(gara).includes("_id"), false);
});

test("l'analisi raggruppa le prestazioni senza perdere i contenuti", () => {
  const analisi = presentaAnalisiPilota({
    pilota: { slug: "leclerc", nome: "Charles Leclerc", codice: "LEC", numero: "16" },
    scuderia: { slug: "ferrari", nome: "Ferrari" },
    gara: {
      slug: "olanda-zandvoort",
      nome: "Gran Premio d'Olanda",
      circuito: "Zandvoort",
      paese: "Olanda",
      stagione: 2026,
      ordineAnalisi: 1,
    },
    posizioniStoriche: "2025: P3",
    spiegazionePosizioni: "Nota",
    qualificheStoriche: "2025: Q2",
    passoGara: "Competitivo",
    gomme: "Buona gestione",
    affidabilita: "Alta",
    considerazioni: "Favorito",
    aggiornamentiInArrivo: "",
    storicoEdizioni: [],
    fonti: ["https://example.com"],
  });

  assert.deepEqual(analisi.prestazioni, {
    passoGara: "Competitivo",
    gestioneGomme: "Buona gestione",
    affidabilita: "Alta",
  });
  assert.equal(analisi.considerazioniFinali, "Favorito");
  assert.equal(analisi.gara.stato, "attuale");
});
