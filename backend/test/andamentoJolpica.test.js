const test = require("node:test");
const assert = require("node:assert/strict");
const { costruisciEventi } = require("../services/andamentoJolpica");

function rispostaGare(gare) {
  return {
    MRData: {
      RaceTable: {
        Races: gare,
      },
    },
  };
}

test("unisce risultati Jolpica di gara e qualifica per round", () => {
  const risultati = rispostaGare([
    {
      round: "2",
      raceName: "Chinese Grand Prix",
      Circuit: { circuitId: "shanghai" },
      Results: [{ position: "4" }],
    },
    {
      round: "1",
      raceName: "Australian Grand Prix",
      Circuit: { circuitId: "albert_park" },
      Results: [{ position: "2" }],
    },
  ]);
  const qualifiche = rispostaGare([
    { round: "1", QualifyingResults: [{ position: "3" }] },
    { round: "2", QualifyingResults: [{ position: "1" }] },
  ]);

  assert.deepEqual(costruisciEventi(risultati, qualifiche), [
    { round: 1, etichetta: "Melbourne", gara: 2, qualifica: 3 },
    { round: 2, etichetta: "Shanghai", gara: 4, qualifica: 1 },
  ]);
});

test("mantiene il risultato di gara quando manca la qualifica", () => {
  const risultati = rispostaGare([
    {
      round: "1",
      raceName: "Australian Grand Prix",
      Results: [{ position: "10" }],
    },
  ]);

  assert.deepEqual(costruisciEventi(risultati, rispostaGare([])), [
    { round: 1, etichetta: "Australian", gara: 10, qualifica: null },
  ]);
});
