const test = require("node:test");
const assert = require("node:assert/strict");
const {
  NOTA_PREDEFINITA,
  normalizzaNotaBene,
  normalizzaTestiAnnuali,
} = require("../utils/normalizzaNotaBene");

test("mantiene compatibili le vecchie note testuali", () => {
  assert.deepEqual(normalizzaNotaBene("2025: Nota esistente"), {
    2025: "Nota esistente",
  });
});

test("mantiene le note separate per anno nel formato usato dal database", () => {
  assert.deepEqual(
    normalizzaNotaBene({
      2025: "Nota del 2025",
      2023: "Nota del 2023",
      2024: "",
    }),
    {
      2023: "Nota del 2023",
      2024: NOTA_PREDEFINITA,
      2025: "Nota del 2025",
    },
  );
});

test("rifiuta chiavi che non rappresentano un anno", () => {
  assert.throws(
    () => normalizzaNotaBene({ recente: "Nota" }),
    /Anno non valido/,
  );
});

test("converte anche le vecchie stringhe annuali in oggetti", () => {
  assert.deepEqual(
    normalizzaTestiAnnuali({
      2025: "Testo recente",
      2023: "Testo storico",
    }),
    {
      2023: "Testo storico",
      2025: "Testo recente",
    },
  );
});

test("conserva come generale un testo non attribuibile a un anno", () => {
  assert.deepEqual(normalizzaTestiAnnuali("Testo senza anno"), {
    generale: "Testo senza anno",
  });
});
