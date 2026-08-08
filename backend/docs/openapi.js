const rispostaErrore = {
  description: "Richiesta non completata",
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Errore" },
    },
  },
};

function rispostaJson(descrizione, riferimentoSchema) {
  return {
    description: descrizione,
    content: {
      "application/json": {
        schema: { $ref: riferimentoSchema },
      },
    },
  };
}

const documentoOpenApi = {
  openapi: "3.1.0",
  info: {
    title: "F1 Stats API",
    version: "1.1.0",
    description:
      "API pubblica, di sola lettura. Le analisi sono disponibili esclusivamente per il Gran Premio attuale; gare future e relative analisi non sono esposte.",
  },
  servers: [{ url: "/api/v1", description: "Server corrente" }],
  tags: [
    { name: "Servizio" },
    { name: "Piloti" },
    { name: "Scuderie" },
    { name: "Gare" },
    { name: "Classifiche" },
    { name: "Analisi" },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Servizio"],
        summary: "Descrizione e indice dell'API",
        responses: { 200: { description: "Indice degli endpoint" } },
      },
    },
    "/health": {
      get: {
        tags: ["Servizio"],
        summary: "Stato del servizio e del database",
        responses: {
          200: { description: "Servizio disponibile" },
          503: { description: "Database non disponibile" },
        },
      },
    },
    "/home": {
      get: {
        tags: ["Servizio"],
        summary: "Dati aggregati per la home",
        description:
          "Restituisce il Gran Premio attuale, l'elenco dei piloti e l'elenco delle scuderie.",
        responses: {
          200: rispostaJson("Contenuto della home", "#/components/schemas/Home"),
          404: rispostaErrore,
        },
      },
    },
    "/piloti": {
      get: {
        tags: ["Piloti"],
        summary: "Elenco dei piloti",
        responses: {
          200: rispostaJson(
            "Piloti ordinati per posizione in classifica",
            "#/components/schemas/ElencoPiloti",
          ),
        },
      },
    },
    "/piloti/{pilotaSlug}": {
      get: {
        tags: ["Piloti"],
        summary: "Scheda completa di un pilota",
        description:
          "Restituisce profilo, analisi del Gran Premio attuale e andamento della stagione corrente fino ai GP registrati.",
        parameters: [{ $ref: "#/components/parameters/PilotaSlug" }],
        responses: {
          200: rispostaJson(
            "Scheda del pilota",
            "#/components/schemas/DettaglioPilota",
          ),
          400: rispostaErrore,
          404: rispostaErrore,
        },
      },
    },
    "/scuderie": {
      get: {
        tags: ["Scuderie"],
        summary: "Elenco delle scuderie",
        responses: {
          200: rispostaJson(
            "Scuderie ordinate per posizione in classifica",
            "#/components/schemas/ElencoScuderie",
          ),
        },
      },
    },
    "/scuderie/{scuderiaSlug}": {
      get: {
        tags: ["Scuderie"],
        summary: "Scheda completa di una scuderia",
        description:
          "Restituisce profilo, piloti, analisi del Gran Premio attuale e andamento.",
        parameters: [{ $ref: "#/components/parameters/ScuderiaSlug" }],
        responses: {
          200: rispostaJson(
            "Scheda della scuderia",
            "#/components/schemas/DettaglioScuderia",
          ),
          400: rispostaErrore,
          404: rispostaErrore,
        },
      },
    },
    "/gare": {
      get: {
        tags: ["Gare"],
        summary: "Elenco delle gare pubblicamente disponibili",
        description:
          "Restituisce sempre e soltanto il Gran Premio attuale. Non espone calendario futuro o analisi future.",
        responses: {
          200: rispostaJson(
            "Elenco contenente la gara attuale",
            "#/components/schemas/ElencoGare",
          ),
          404: rispostaErrore,
        },
      },
    },
    "/gare/attuale": {
      get: {
        tags: ["Gare"],
        summary: "Gran Premio attuale",
        responses: {
          200: rispostaJson(
            "Contenuto completo della gara attuale",
            "#/components/schemas/RispostaGara",
          ),
          404: rispostaErrore,
        },
      },
    },
    "/gare/{garaSlug}": {
      get: {
        tags: ["Gare"],
        summary: "Dettaglio della gara attuale",
        description:
          "Lo slug deve appartenere al Gran Premio attuale. Qualsiasi altra gara restituisce 404.",
        parameters: [{ $ref: "#/components/parameters/GaraSlug" }],
        responses: {
          200: rispostaJson(
            "Gara con analisi dei piloti e delle scuderie",
            "#/components/schemas/DettaglioGara",
          ),
          400: rispostaErrore,
          404: rispostaErrore,
        },
      },
    },
    "/classifiche/piloti": {
      get: {
        tags: ["Classifiche"],
        summary: "Classifica piloti della stagione attuale",
        responses: {
          200: rispostaJson(
            "Classifica piloti",
            "#/components/schemas/ClassificaPiloti",
          ),
          404: rispostaErrore,
        },
      },
    },
    "/classifiche/scuderie": {
      get: {
        tags: ["Classifiche"],
        summary: "Classifica scuderie della stagione attuale",
        responses: {
          200: rispostaJson(
            "Classifica scuderie",
            "#/components/schemas/ClassificaScuderie",
          ),
          404: rispostaErrore,
        },
      },
    },
    "/gare/{garaSlug}/piloti/{pilotaSlug}/analisi": {
      get: {
        tags: ["Analisi"],
        summary: "Analisi di un pilota per il Gran Premio attuale",
        parameters: [
          { $ref: "#/components/parameters/GaraSlug" },
          { $ref: "#/components/parameters/PilotaSlug" },
        ],
        responses: {
          200: rispostaJson(
            "Analisi completa del pilota",
            "#/components/schemas/RispostaAnalisiPilota",
          ),
          400: rispostaErrore,
          404: rispostaErrore,
        },
      },
    },
    "/gare/{garaSlug}/scuderie/{scuderiaSlug}/analisi": {
      get: {
        tags: ["Analisi"],
        summary: "Analisi di una scuderia per il Gran Premio attuale",
        parameters: [
          { $ref: "#/components/parameters/GaraSlug" },
          { $ref: "#/components/parameters/ScuderiaSlug" },
        ],
        responses: {
          200: rispostaJson(
            "Analisi completa della scuderia",
            "#/components/schemas/RispostaAnalisiScuderia",
          ),
          400: rispostaErrore,
          404: rispostaErrore,
        },
      },
    },
  },
  components: {
    parameters: {
      GaraSlug: {
        name: "garaSlug",
        in: "path",
        required: true,
        schema: { type: "string", pattern: "^[a-z0-9]+(?:[-_][a-z0-9]+)*$" },
        example: "olanda-zandvoort",
      },
      PilotaSlug: {
        name: "pilotaSlug",
        in: "path",
        required: true,
        schema: { type: "string", pattern: "^[a-z0-9]+(?:[-_][a-z0-9]+)*$" },
        example: "leclerc",
      },
      ScuderiaSlug: {
        name: "scuderiaSlug",
        in: "path",
        required: true,
        schema: { type: "string", pattern: "^[a-z0-9]+(?:[-_][a-z0-9]+)*$" },
        example: "ferrari",
      },
    },
    schemas: {
      Classifica: {
        type: "object",
        required: ["posizione", "punti", "vittorie"],
        properties: {
          posizione: { type: "integer", minimum: 1 },
          punti: { type: "number", minimum: 0 },
          vittorie: { type: "integer", minimum: 0 },
        },
      },
      ScuderiaBreve: {
        type: "object",
        required: ["slug", "nome"],
        properties: {
          slug: { type: "string", example: "ferrari" },
          nome: { type: "string", example: "Ferrari" },
        },
      },
      PilotaBreve: {
        type: "object",
        required: ["slug", "nome", "codice", "numero"],
        properties: {
          slug: { type: "string", example: "leclerc" },
          nome: { type: "string", example: "Charles Leclerc" },
          codice: { type: "string", example: "LEC" },
          numero: { type: "string", example: "16" },
        },
      },
      Pilota: {
        allOf: [
          { $ref: "#/components/schemas/PilotaBreve" },
          {
            type: "object",
            required: ["nazionalita", "scuderia", "classifica"],
            properties: {
              nazionalita: { type: "string", example: "Monegasca" },
              scuderia: { $ref: "#/components/schemas/ScuderiaBreve" },
              classifica: { $ref: "#/components/schemas/Classifica" },
              aggiornatoIl: {
                type: ["string", "null"],
                format: "date-time",
              },
            },
          },
        ],
      },
      Scuderia: {
        allOf: [
          { $ref: "#/components/schemas/ScuderiaBreve" },
          {
            type: "object",
            required: ["nomeClassifica", "nazionalita", "classifica"],
            properties: {
              nomeClassifica: { type: "string" },
              nazionalita: { type: "string" },
              denominazioniStoriche: {
                type: "object",
                additionalProperties: { type: ["string", "null"] },
              },
              classifica: { $ref: "#/components/schemas/Classifica" },
              aggiornatoIl: {
                type: ["string", "null"],
                format: "date-time",
              },
            },
          },
        ],
      },
      GaraBreve: {
        type: "object",
        required: [
          "slug",
          "nome",
          "circuito",
          "paese",
          "stagione",
          "ordineAnalisi",
          "stato",
        ],
        properties: {
          slug: { type: "string", example: "olanda-zandvoort" },
          nome: { type: "string", example: "Gran Premio d'Olanda" },
          circuito: { type: "string", example: "Circuit Zandvoort" },
          paese: { type: "string", example: "Olanda" },
          stagione: { type: "integer", example: 2026 },
          ordineAnalisi: { type: "integer", minimum: 1 },
          stato: { type: "string", const: "attuale" },
        },
      },
      Gara: {
        allOf: [
          { $ref: "#/components/schemas/GaraBreve" },
          {
            type: "object",
            properties: {
              contestoStorico: { type: "string" },
              pilotiFavoriti: { type: "string" },
              scuderieFavorite: { type: "string" },
              outsider: { type: "string" },
              potenzialiDifficolta: { type: "string" },
              gommeStrategia: { type: "string" },
              rischi: { type: "string" },
              confidenza: { type: "string" },
              fonti: { type: "array", items: { type: "string", format: "uri" } },
              aggiornatoIl: {
                type: ["string", "null"],
                format: "date-time",
              },
            },
          },
        ],
      },
      Prestazioni: {
        type: "object",
        required: ["passoGara", "gestioneGomme", "affidabilita"],
        properties: {
          passoGara: {
            $ref: "#/components/schemas/TestiAnnuali",
            description:
              "Analisi editoriale del passo gara, indicizzata per stagione.",
          },
          gestioneGomme: {
            $ref: "#/components/schemas/TestiAnnuali",
            description:
              "Analisi editoriale della gestione gomme, indicizzata per stagione.",
          },
          affidabilita: {
            type: "string",
            description:
              "Valutazione editoriale degli eventuali problemi di affidabilità rilevanti.",
          },
        },
      },
      TestiAnnuali: {
        type: "object",
        description:
          "Contenuti separati per stagione. Le proprietà usano l'anno nel formato AAAA; `generale` conserva una sintesi non attribuibile a una singola stagione.",
        propertyNames: { pattern: "^(?:\\d{4}|generale)$" },
        additionalProperties: { type: "string" },
        example: {
          2023: "Contenuto relativo alla stagione 2023.",
          2024: "Contenuto relativo alla stagione 2024.",
          2025: "Contenuto relativo alla stagione 2025.",
        },
      },
      StoricoEdizione: {
        type: "object",
        required: [
          "stagione",
          "posizioneGara",
          "posizioneQualifica",
          "notaRisultato",
          "passoGara",
          "gestioneGomme",
          "affidabilita",
        ],
        description:
          "Risultato registrato al termine di un GP della stagione corrente.",
        properties: {
          stagione: { type: "integer" },
          posizioneGara: { type: "string" },
          posizioneQualifica: { type: "string" },
          notaRisultato: { type: "string" },
          passoGara: { type: "string" },
          gestioneGomme: { type: "string" },
          affidabilita: { type: "string" },
        },
      },
      AnalisiBase: {
        type: "object",
        required: [
          "gara",
          "risultatiGara",
          "notaBene",
          "risultatiQualifica",
          "andamentoPerAnno",
          "prestazioni",
          "considerazioniFinali",
          "storicoEdizioni",
          "fonti",
        ],
        properties: {
          gara: { $ref: "#/components/schemas/GaraBreve" },
          risultatiGara: {
            $ref: "#/components/schemas/TestiAnnuali",
            description: "Risultati di gara separati per stagione.",
          },
          notaBene: {
            $ref: "#/components/schemas/TestiAnnuali",
            description:
              "N.B. separati per stagione. Se non esistono episodi rilevanti, il valore dell'anno è `Nessun evento particolare da trattare`; `generale` indica una nota valida per l'intero storico.",
          },
          risultatiQualifica: {
            $ref: "#/components/schemas/TestiAnnuali",
            description: "Risultati di qualifica separati per stagione.",
          },
          andamentoPerAnno: {
            $ref: "#/components/schemas/TestiAnnuali",
            description:
              "Testo editoriale opzionale separato per stagione; se l'oggetto è vuoto, l'andamento viene calcolato dai risultati.",
          },
          prestazioni: { $ref: "#/components/schemas/Prestazioni" },
          considerazioniFinali: {
            type: "string",
            description:
              "Valutazione editoriale conclusiva sull'adattamento al circuito e sulle prospettive per il Gran Premio attuale.",
          },
          aggiornamentiInArrivo: {
            type: "string",
            description:
              "Aggiornamenti tecnici confermati o stato delle informazioni disponibili, con una valutazione della loro utilità per le caratteristiche del circuito.",
          },
          storicoEdizioni: {
            type: "array",
            items: { $ref: "#/components/schemas/StoricoEdizione" },
          },
          fonti: { type: "array", items: { type: "string", format: "uri" } },
          aggiornatoIl: { type: ["string", "null"], format: "date-time" },
        },
      },
      AnalisiPilota: {
        allOf: [
          { $ref: "#/components/schemas/AnalisiBase" },
          {
            type: "object",
            required: ["pilota", "scuderia", "penalita"],
            properties: {
              pilota: { $ref: "#/components/schemas/PilotaBreve" },
              scuderia: { $ref: "#/components/schemas/ScuderiaBreve" },
              penalita: {
                type: "string",
                description:
                  "Situazione delle eventuali penalità del pilota per il Gran Premio attuale, aggiornata alla data indicata nel testo.",
                example:
                  "Al momento non è stata pubblicata alcuna penalità per il pilota a Zandvoort. La situazione sarà ricontrollata nei documenti FIA del weekend.",
              },
            },
          },
        ],
      },
      AnalisiScuderia: {
        allOf: [
          { $ref: "#/components/schemas/AnalisiBase" },
          {
            type: "object",
            properties: {
              scuderia: { $ref: "#/components/schemas/ScuderiaBreve" },
            },
          },
        ],
      },
      Andamento: {
        type: "object",
        description:
          "Posizioni della stagione corrente fino all'ultimo GP disponibile. Jolpica e la fonte primaria; il database locale e usato come ripiego.",
        properties: {
          stagione: { type: "integer" },
          etichette: { type: "array", items: { type: "string" } },
          qualifica: { type: "array", items: { type: "object" } },
          gara: { type: "array", items: { type: "object" } },
          fonte: {
            type: ["object", "null"],
            properties: {
              nome: { type: "string" },
              url: { type: ["string", "null"], format: "uri" },
            },
          },
          aggiornatoIl: { type: ["string", "null"], format: "date-time" },
        },
      },
      ElencoPiloti: {
        type: "object",
        properties: {
          totale: { type: "integer" },
          piloti: { type: "array", items: { $ref: "#/components/schemas/Pilota" } },
        },
      },
      ElencoScuderie: {
        type: "object",
        properties: {
          totale: { type: "integer" },
          scuderie: {
            type: "array",
            items: { $ref: "#/components/schemas/Scuderia" },
          },
        },
      },
      ElencoGare: {
        type: "object",
        properties: {
          totale: { type: "integer", const: 1 },
          gare: { type: "array", items: { $ref: "#/components/schemas/GaraBreve" } },
        },
      },
      RispostaGara: {
        type: "object",
        properties: { gara: { $ref: "#/components/schemas/Gara" } },
      },
      DettaglioPilota: {
        type: "object",
        properties: {
          pilota: { $ref: "#/components/schemas/Pilota" },
          analisi: {
            oneOf: [
              { $ref: "#/components/schemas/AnalisiPilota" },
              { type: "null" },
            ],
          },
          andamentoStagioneCorrente: {
            $ref: "#/components/schemas/Andamento",
          },
        },
      },
      DettaglioScuderia: {
        type: "object",
        properties: {
          scuderia: { $ref: "#/components/schemas/Scuderia" },
          piloti: { type: "array", items: { $ref: "#/components/schemas/Pilota" } },
          analisi: {
            oneOf: [
              { $ref: "#/components/schemas/AnalisiScuderia" },
              { type: "null" },
            ],
          },
          andamentoStagioneCorrente: {
            $ref: "#/components/schemas/Andamento",
          },
        },
      },
      Home: {
        type: "object",
        properties: {
          garaAttuale: { $ref: "#/components/schemas/GaraBreve" },
          piloti: { type: "array", items: { $ref: "#/components/schemas/Pilota" } },
          scuderie: {
            type: "array",
            items: { $ref: "#/components/schemas/Scuderia" },
          },
          metadati: { type: "object" },
        },
      },
      DettaglioGara: {
        type: "object",
        properties: {
          gara: { $ref: "#/components/schemas/Gara" },
          analisiPiloti: {
            type: "array",
            items: { $ref: "#/components/schemas/AnalisiPilota" },
          },
          analisiScuderie: {
            type: "array",
            items: { $ref: "#/components/schemas/AnalisiScuderia" },
          },
        },
      },
      ClassificaPiloti: { type: "object" },
      ClassificaScuderie: { type: "object" },
      RispostaAnalisiPilota: {
        type: "object",
        properties: {
          analisi: { $ref: "#/components/schemas/AnalisiPilota" },
        },
      },
      RispostaAnalisiScuderia: {
        type: "object",
        properties: {
          analisi: { $ref: "#/components/schemas/AnalisiScuderia" },
        },
      },
      Errore: {
        type: "object",
        required: ["errore"],
        properties: {
          errore: {
            type: "object",
            required: ["codice", "messaggio", "requestId"],
            properties: {
              codice: { type: "string", example: "PILOTA_NON_TROVATO" },
              messaggio: {
                type: "string",
                example: "Il pilota richiesto non esiste",
              },
              requestId: { type: "string", format: "uuid" },
            },
          },
        },
      },
    },
  },
};

module.exports = documentoOpenApi;
