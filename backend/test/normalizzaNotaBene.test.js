const test = require("node:test");
const assert = require("node:assert/strict");
const {
  NOTA_PREDEFINITA,
  normalizzaNotaBene,
  normalizzaTestiAnnuali,
} = require("../utils/normalizzaNotaBene");

test("mantiene compatibili le vecchie note testuali", () => {
  assert.equal(normalizzaNotaBene("2025: Nota esistente"), "2025: Nota esistente");
});

test("converte le note separate per anno nel formato usato dal database", () => {
  assert.equal(
    normalizzaNotaBene({
      2025: "Nota del 2025",
      2023: "Nota del 2023",
      2024: "",
    }),
    `2023: Nota del 2023\n2024: ${NOTA_PREDEFINITA}\n2025: Nota del 2025`,
  );
});

test("rifiuta chiavi che non rappresentano un anno", () => {
  assert.throws(
    () => normalizzaNotaBene({ recente: "Nota" }),
    /Anno non valido/,
  );
});

test("converte anche passo gara e gestione gomme separati per anno", () => {
  assert.equal(
    normalizzaTestiAnnuali({
      2025: "Testo recente",
      2023: "Testo storico",
    }),
    "2023: Testo storico\n2025: Testo recente",
  );
});
