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
const dati = require("../data/dati-iniziali.json");

async function salvaDocumentiPerSlug(Modello, documenti) {
  const operazioni = documenti.map((documento) => ({
    updateOne: {
      filter: { slug: documento.slug },
      update: { $set: documento },
      upsert: true,
    },
  }));

  return Modello.bulkWrite(operazioni);
}

async function salvaGare(documenti) {
  const operazioni = documenti.map(({ stato, ...gara }) => ({
    updateOne: {
      filter: { slug: gara.slug },
      update: {
        $set: gara,
        $setOnInsert: { stato: stato || "futura" },
      },
      upsert: true,
    },
  }));

  const risultato = await Gara.bulkWrite(operazioni);

  await Gara.updateMany(
    { stato: { $exists: false } },
    { $set: { stato: "futura" } },
  );

  await Gara.updateMany(
    { stato: "prossima" },
    { $set: { stato: "attuale" } },
  );

  const attualeEsistente = await Gara.exists({ stato: "attuale" });
  const attualeDichiarata = documenti.find(
    (gara) => gara.stato === "attuale",
  );

  if (!attualeEsistente && attualeDichiarata) {
    await Gara.updateOne(
      { slug: attualeDichiarata.slug },
      { $set: { stato: "attuale" } },
    );
  }

  return risultato;
}

function stampaRisultato(nome, risultato) {
  console.log(
    `${nome}: ${risultato.upsertedCount} creati, ` +
      `${risultato.modifiedCount} aggiornati`,
  );
}

async function importaDati() {
  try {
    await collegaDatabase();

    const risultatoScuderie = await salvaDocumentiPerSlug(
      Scuderia,
      dati.scuderie,
    );

    const scuderie = await Scuderia.find().lean();
    const scuderiaPerSlug = new Map(
      scuderie.map((scuderia) => [scuderia.slug, scuderia]),
    );

    const pilotiConRiferimenti = dati.piloti.map((pilota) => ({
      slug: pilota.slug,
      nome: pilota.nome,
      codice: pilota.codice,
      numero: pilota.numero,
      nazionalita: pilota.nazionalita,
      scuderia: scuderiaPerSlug.get(pilota.scuderiaSlug)._id,
      classifica2026: pilota.classifica2026,
    }));

    const risultatoPiloti = await salvaDocumentiPerSlug(
      Pilota,
      pilotiConRiferimenti,
    );
    const risultatoGare = await salvaGare(dati.gare);

    const [piloti, gare] = await Promise.all([
      Pilota.find().lean(),
      Gara.find().lean(),
    ]);

    const pilotaPerSlug = new Map(
      piloti.map((pilota) => [pilota.slug, pilota]),
    );
    const garaPerSlug = new Map(gare.map((gara) => [gara.slug, gara]));

    const operazioniAnalisiGare = dati.analisiGare.map((analisi) => {
      const documento = {
        pilota: pilotaPerSlug.get(analisi.pilotaSlug)._id,
        gara: garaPerSlug.get(analisi.garaSlug)._id,
        scuderia: scuderiaPerSlug.get(analisi.scuderiaSlug)._id,
        posizioniStoriche: analisi.posizioniStoriche,
        spiegazionePosizioni: analisi.spiegazionePosizioni,
        qualificheStoriche: analisi.qualificheStoriche,
        passoGara: analisi.passoGara,
        gomme: analisi.gomme,
        considerazioni: analisi.considerazioni,
        fonti: analisi.fonti,
      };

      if (analisi.affidabilita) {
        documento.affidabilita = analisi.affidabilita;
      }

      return {
        updateOne: {
          filter: { pilota: documento.pilota, gara: documento.gara },
          update: { $set: documento },
          upsert: true,
        },
      };
    });

    const operazioniAnalisiScuderie = dati.analisiScuderie.map((analisi) => {
      const scuderiaId = scuderiaPerSlug.get(analisi.scuderiaSlug)._id;
      const garaId = garaPerSlug.get(analisi.garaSlug)._id;

      return {
        updateOne: {
          filter: { scuderia: scuderiaId, gara: garaId },
          update: {
            $set: {
              scuderia: scuderiaId,
              gara: garaId,
              posizioniStoriche: analisi.posizioniStoriche,
              spiegazionePosizioni: analisi.spiegazionePosizioni,
              qualificheStoriche: analisi.qualificheStoriche,
              passoGara: analisi.passoGara,
              gomme: analisi.gomme,
              considerazioni: analisi.considerazioni,
              fonti: analisi.fonti,
            },
            $setOnInsert: {
              aggiornamentiInArrivo: analisi.aggiornamentiInArrivo,
              storicoEdizioni: [],
            },
          },
          upsert: true,
        },
      };
    });

    const [risultatoAnalisiGare, risultatoAnalisiScuderie] =
      await Promise.all([
        AnalisiGara.bulkWrite(operazioniAnalisiGare),
        AnalisiScuderia.bulkWrite(operazioniAnalisiScuderie),
      ]);

    stampaRisultato("Scuderie", risultatoScuderie);
    stampaRisultato("Piloti", risultatoPiloti);
    stampaRisultato("Gare", risultatoGare);
    stampaRisultato("Analisi piloti", risultatoAnalisiGare);
    stampaRisultato("Analisi scuderie", risultatoAnalisiScuderie);
    console.log("Importazione completata.");
  } catch (errore) {
    console.error("Importazione fallita:", errore.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

importaDati();
