const Scuderia = require("../models/Scuderia");
const Pilota = require("../models/Pilota");
const AnalisiScuderia = require("../models/AnalisiScuderia");
const trovaGaraAttuale = require("../services/garaAttuale");
const creaAndamentoAnnuale = require("../services/andamentoAnnuale");

async function elencaScuderie(richiesta, risposta) {
  const scuderie = await Scuderia.find()
    .sort("classifica2026.posizione")
    .lean();

  risposta.json({ totale: scuderie.length, scuderie });
}

async function dettaglioScuderia(richiesta, risposta) {
  const scuderia = await Scuderia.findOne({ slug: richiesta.params.slug }).lean();

  if (!scuderia) {
    return risposta.status(404).json({ messaggio: "Scuderia non trovata" });
  }

  const garaAttuale = await trovaGaraAttuale();
  const [piloti, analisiComplete] = await Promise.all([
    Pilota.find({ scuderia: scuderia._id })
      .sort("classifica2026.posizione")
      .lean(),
    AnalisiScuderia.find({ scuderia: scuderia._id })
      .populate("gara", "slug nome circuito paese ordineAnalisi stagione stato")
      .lean(),
  ]);
  const analisi = garaAttuale
    ? analisiComplete.find(
        (elemento) => String(elemento.gara._id) === String(garaAttuale._id),
      ) || null
    : null;
  const andamentoUltimoAnno = creaAndamentoAnnuale({
    analisi: analisiComplete,
    stagione: creaAndamentoAnnuale.trovaStagionePiuRecente(
      analisiComplete,
      garaAttuale?.stagione || new Date().getFullYear(),
    ),
  });

  risposta.json({ scuderia, piloti, analisi, andamentoUltimoAnno });
}

module.exports = { elencaScuderie, dettaglioScuderia };
