const AnalisiGara = require("../models/AnalisiGara");
const AnalisiScuderia = require("../models/AnalisiScuderia");
const trovaGaraAttuale = require("../services/garaAttuale");

async function elencaGare(richiesta, risposta) {
  const garaAttuale = await trovaGaraAttuale();
  const gare = garaAttuale ? [garaAttuale] : [];

  risposta.json({ totale: gare.length, gare });
}

async function dettaglioGara(richiesta, risposta) {
  const gara = await trovaGaraAttuale();

  if (!gara || gara.slug !== richiesta.params.slug) {
    return risposta.status(404).json({ messaggio: "Gara non trovata" });
  }

  const [analisiPiloti, analisiScuderie] = await Promise.all([
    AnalisiGara.find({ gara: gara._id })
      .populate("pilota", "slug nome codice numero classifica2026")
      .populate("scuderia", "slug nome")
      .lean(),
    AnalisiScuderia.find({ gara: gara._id })
      .populate("scuderia", "slug nome classifica2026")
      .lean(),
  ]);

  analisiPiloti.sort((prima, seconda) => {
    return prima.pilota.classifica2026.posizione - seconda.pilota.classifica2026.posizione;
  });

  analisiScuderie.sort((prima, seconda) => {
    return prima.scuderia.classifica2026.posizione - seconda.scuderia.classifica2026.posizione;
  });

  risposta.json({ gara, analisiPiloti, analisiScuderie });
}

module.exports = { elencaGare, dettaglioGara };
