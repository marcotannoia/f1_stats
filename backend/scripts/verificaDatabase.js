const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env"), quiet: true });

const collegaDatabase = require("../config/database");
const Pilota = require("../models/Pilota");
const Scuderia = require("../models/Scuderia");
const Gara = require("../models/Gara");
const AnalisiGara = require("../models/AnalisiGara");
const AnalisiScuderia = require("../models/AnalisiScuderia");

const attesi = {
  piloti: 22,
  scuderie: 11,
  gare: 12,
  analisiGare: 264,
  analisiScuderie: 132,
};

async function verificaDatabase() {
  try {
    await collegaDatabase();

    const risultati = {
      piloti: await Pilota.countDocuments(),
      scuderie: await Scuderia.countDocuments(),
      gare: await Gara.countDocuments(),
      analisiGare: await AnalisiGara.countDocuments(),
      analisiScuderie: await AnalisiScuderia.countDocuments(),
    };

    const statoGare = {
      attuali: await Gara.countDocuments({ stato: "attuale" }),
      precedenti: await Gara.countDocuments({ stato: "prossima" }),
      mancanti: await Gara.countDocuments({
        $or: [{ stato: null }, { stato: { $exists: false } }],
      }),
    };

    for (const [nome, quantita] of Object.entries(risultati)) {
      const esito = quantita === attesi[nome] ? "OK" : "ERRORE";
      console.log(`${esito} ${nome}: ${quantita}/${attesi[nome]}`);
    }

    const tuttoCorretto = Object.entries(risultati).every(
      ([nome, quantita]) => quantita === attesi[nome],
    );

    if (!tuttoCorretto) {
      process.exitCode = 1;
      return;
    }

    const statoEditorialeCorretto =
      statoGare.attuali === 1 &&
      statoGare.precedenti === 0 &&
      statoGare.mancanti === 0;

    console.log(
      `${statoEditorialeCorretto ? "OK" : "ERRORE"} stato gare: ` +
        `${statoGare.attuali} attuale, ${statoGare.precedenti} legacy, ` +
        `${statoGare.mancanti} senza stato`,
    );

    if (!statoEditorialeCorretto) {
      process.exitCode = 1;
      return;
    }

    const [analisiPerPilota, analisiPilotaPerGara, analisiPerScuderia, analisiScuderiaPerGara] =
      await Promise.all([
        AnalisiGara.aggregate([
          { $group: { _id: "$pilota", totale: { $sum: 1 } } },
        ]),
        AnalisiGara.aggregate([
          { $group: { _id: "$gara", totale: { $sum: 1 } } },
        ]),
        AnalisiScuderia.aggregate([
          { $group: { _id: "$scuderia", totale: { $sum: 1 } } },
        ]),
        AnalisiScuderia.aggregate([
          { $group: { _id: "$gara", totale: { $sum: 1 } } },
        ]),
      ]);

    const coperturaCompleta =
      analisiPerPilota.every((gruppo) => gruppo.totale === 12) &&
      analisiPilotaPerGara.every((gruppo) => gruppo.totale === 22) &&
      analisiPerScuderia.every((gruppo) => gruppo.totale === 12) &&
      analisiScuderiaPerGara.every((gruppo) => gruppo.totale === 11);

    console.log(
      `${coperturaCompleta ? "OK" : "ERRORE"} copertura: ` +
        "12 gare per ogni pilota e scuderia",
    );

    if (!coperturaCompleta) {
      process.exitCode = 1;
      return;
    }

    console.log("Database verificato correttamente.");
  } catch (errore) {
    console.error("Verifica fallita:", errore.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

verificaDatabase();
