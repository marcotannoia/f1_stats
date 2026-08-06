const test = require("node:test");
const assert = require("node:assert/strict");
const Gara = require("../models/Gara");
const trovaGaraAttuale = require("../services/garaAttuale");

function queryConRisultato(risultato) {
  return {
    sort() {
      return this;
    },
    async lean() {
      return risultato;
    },
  };
}

test("seleziona esclusivamente lo stato attuale", async (t) => {
  const originale = Gara.findOne;
  const filtri = [];

  t.after(() => {
    Gara.findOne = originale;
  });

  Gara.findOne = (filtro) => {
    filtri.push(filtro);
    return queryConRisultato({ slug: "olanda-zandvoort", stato: "attuale" });
  };

  const gara = await trovaGaraAttuale();

  assert.equal(gara.slug, "olanda-zandvoort");
  assert.equal(gara.stato, "attuale");
  assert.deepEqual(filtri, [{ stato: "attuale" }]);
});

test("accetta il vecchio flag senza ripiegare su una gara futura", async (t) => {
  const originale = Gara.findOne;
  const filtri = [];

  t.after(() => {
    Gara.findOne = originale;
  });

  Gara.findOne = (filtro) => {
    filtri.push(filtro);
    const risultato = filtri.length === 1
      ? null
      : { slug: "olanda-zandvoort", stato: "prossima" };
    return queryConRisultato(risultato);
  };

  const gara = await trovaGaraAttuale();

  assert.equal(gara.stato, "attuale");
  assert.deepEqual(filtri, [
    { stato: "attuale" },
    { stato: "prossima" },
  ]);
  assert.equal(
    filtri.some((filtro) => filtro.stato?.$ne === "conclusa"),
    false,
  );
});
