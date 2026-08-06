const test = require("node:test");
const assert = require("node:assert/strict");
const creaAndamentoAnnuale = require("../services/andamentoAnnuale");

function analisiGara({
  slug,
  ordineAnalisi,
  storicoEdizioni = [],
  posizioniStoriche = "2025: P8",
  qualificheStoriche = "2025: Q6",
}) {
  return {
    gara: {
      slug,
      circuito: slug,
      ordineAnalisi,
      stagione: 2026,
    },
    storicoEdizioni,
    posizioniStoriche,
    qualificheStoriche,
  };
}

test("mostra soltanto i GP registrati della stagione corrente", () => {
  const andamento = creaAndamentoAnnuale({
    stagione: 2026,
    codicePilota: "LEC",
    analisi: [
      analisiGara({ slug: "olanda-zandvoort", ordineAnalisi: 1 }),
      analisiGara({
        slug: "italia-monza",
        ordineAnalisi: 2,
        storicoEdizioni: [
          {
            stagione: 2026,
            posizioneGara: "P4",
            posizioneQualifica: "Q2",
          },
        ],
      }),
      analisiGara({ slug: "azerbaigian-baku", ordineAnalisi: 3 }),
    ],
  });

  assert.equal(andamento.stagione, 2026);
  assert.deepEqual(andamento.etichette, ["Monza"]);
  assert.deepEqual(andamento.qualifica, [
    { nome: "LEC", valori: [2] },
  ]);
  assert.deepEqual(andamento.gara, [{ nome: "LEC", valori: [4] }]);
});

test("mantiene il GP se esiste la qualifica ma la gara termina con DNF", () => {
  const andamento = creaAndamentoAnnuale({
    stagione: 2026,
    codicePilota: "LEC",
    analisi: [
      analisiGara({
        slug: "olanda-zandvoort",
        ordineAnalisi: 1,
        storicoEdizioni: [
          {
            stagione: 2026,
            posizioneGara: "DNF",
            posizioneQualifica: "Q5",
          },
        ],
      }),
    ],
  });

  assert.deepEqual(andamento.etichette, ["Zandvoort"]);
  assert.deepEqual(andamento.qualifica[0].valori, [5]);
  assert.deepEqual(andamento.gara[0].valori, [null]);
});
