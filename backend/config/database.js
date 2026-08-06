const mongoose = require("mongoose");
const ambiente = require("./ambiente");

async function collegaDatabase() {
  const mongoUrl = ambiente.mongoUrl;

  if (!mongoUrl) {
    throw new Error("La variabile MONGO_URL non è configurata");
  }

  await mongoose.connect(mongoUrl, {
    dbName: ambiente.nomeDatabase,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  });

  console.log(`MongoDB collegato al database: ${mongoose.connection.name}`);
}

module.exports = collegaDatabase;
