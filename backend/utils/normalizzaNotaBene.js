const NOTA_PREDEFINITA = "Nessun evento particolare da trattare";

function normalizzaTestiAnnuali(valore, testoPredefinito = "") {
  if (typeof valore === "string") return valore;

  if (!valore || Array.isArray(valore) || typeof valore !== "object") {
    throw new TypeError(
      "Il contenuto deve essere una stringa o un oggetto diviso per anno",
    );
  }

  return Object.entries(valore)
    .map(([anno, testo]) => {
      if (!/^\d{4}$/.test(anno)) {
        throw new TypeError(`Anno non valido: ${anno}`);
      }

      return [Number(anno), String(testo || "").trim() || testoPredefinito];
    })
    .sort(([primoAnno], [secondoAnno]) => primoAnno - secondoAnno)
    .map(([anno, testo]) => `${anno}: ${testo}`)
    .join("\n");
}

function normalizzaNotaBene(notaBene) {
  return normalizzaTestiAnnuali(notaBene, NOTA_PREDEFINITA);
}

module.exports = {
  NOTA_PREDEFINITA,
  normalizzaNotaBene,
  normalizzaTestiAnnuali,
};
