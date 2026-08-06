const Pilota = require("../models/Pilota");
const AnalisiGara = require("../models/AnalisiGara");
const trovaGaraAttuale = require("../services/garaAttuale");
const creaAndamentoAnnuale = require("../services/andamentoAnnuale");

async function elencaPiloti(richiesta, risposta) {
  const piloti = await Pilota.find()
    .populate("scuderia", "slug nome")
    .sort("classifica2026.posizione")
    .lean();

  risposta.json({ totale: piloti.length, piloti });
}

async function dettaglioPilota(richiesta, risposta) {
  const pilota = await Pilota.findOne({ slug: richiesta.params.slug })
    .populate("scuderia", "slug nome nomeClassifica")
    .lean();

  if (!pilota) {
    return risposta.status(404).json({ messaggio: "Pilota non trovato" });
  }

  const garaAttuale = await trovaGaraAttuale();
  const analisiComplete = await AnalisiGara.find({ pilota: pilota._id })
    .populate("gara", "slug nome circuito paese ordineAnalisi stagione stato")
    .populate("scuderia", "slug nome")
    .lean();
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
    codicePilota: pilota.codice,
  });

  risposta.json({ pilota, analisi, andamentoUltimoAnno });
}

module.exports = { elencaPiloti, dettaglioPilota };
