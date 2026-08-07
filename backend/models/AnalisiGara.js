const mongoose = require("mongoose");

const edizioneStoricaSchema = new mongoose.Schema(
  {
    stagione: { type: Number, required: true },
    posizioneGara: { type: String, required: true, trim: true },
    posizioneQualifica: { type: String, required: true, trim: true },
    notaRisultato: { type: String, default: "", trim: true },
    passoGara: { type: String, default: "", trim: true },
    gomme: { type: String, default: "", trim: true },
    affidabilita: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const analisiGaraSchema = new mongoose.Schema(
  {
    pilota: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pilota",
      required: true,
    },
    gara: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gara",
      required: true,
    },
    scuderia: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scuderia",
      required: true,
    },
    posizioniStoriche: { type: String, required: true },
    spiegazionePosizioni: { type: String, required: true },
    qualificheStoriche: { type: String, required: true },
    andamentoPerAnno: { type: String, default: "" },
    passoGara: { type: String, required: true },
    gomme: { type: String, required: true },
    considerazioni: { type: String, required: true },
    penalita: { type: String, default: "" },
    affidabilita: { type: String, default: "" },
    aggiornamentiInArrivo: { type: String, default: "" },
    storicoEdizioni: { type: [edizioneStoricaSchema], default: [] },
    fonti: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "analisiGare",
  },
);

analisiGaraSchema.index({ pilota: 1, gara: 1 }, { unique: true });
analisiGaraSchema.index({ gara: 1, scuderia: 1 });

module.exports = mongoose.model("AnalisiGara", analisiGaraSchema);
