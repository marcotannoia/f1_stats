const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "../.env"), quiet: true });

const collegaDatabase = require("../config/database");
const Gara = require("../models/Gara");

const FORMATO_SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

async function impostaGaraAttuale() {
  const slug = process.argv[2];

  if (!slug || slug.length > 80 || !FORMATO_SLUG.test(slug)) {
    throw new Error(
      "Indicare uno slug valido: npm run set-current -- olanda-zandvoort",
    );
  }

  await collegaDatabase();

  const gara = await Gara.findOne({ slug }).select("slug stato").lean();

  if (!gara) {
    throw new Error(`La gara ${slug} non esiste`);
  }

  if (gara.stato === "conclusa") {
    throw new Error("Una gara conclusa non puo essere ripubblicata come attuale");
  }

  await Gara.bulkWrite([
    {
      updateMany: {
        filter: {
          _id: { $ne: gara._id },
          $or: [
            { stato: { $in: ["attuale", "prossima"] } },
            { stato: null },
            { stato: { $exists: false } },
          ],
        },
        update: { $set: { stato: "futura" } },
      },
    },
    {
      updateOne: {
        filter: { _id: gara._id },
        update: { $set: { stato: "attuale", conclusaIl: null } },
      },
    },
  ]);

  console.log(`Gran Premio attuale impostato: ${slug}`);
}

impostaGaraAttuale()
  .catch((errore) => {
    console.error(`Aggiornamento fallito: ${errore.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
