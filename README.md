# F1 Stats

F1 Stats è un progetto web dedicato alla consultazione e all'analisi dei dati
della Formula 1.

Il progetto comprende:

- un frontend sviluppato con React e Vite;
- un backend REST sviluppato con Node.js ed Express;
- un database MongoDB contenente piloti, scuderie, Gran Premi, risultati e
  analisi editoriali.

Le API pubbliche sono di sola lettura e permettono ad applicazioni esterne di
utilizzare i dati di F1 Stats nel proprio frontend.

## Documentazione delle API

La documentazione ufficiale degli endpoint è disponibile tramite Swagger:

```text
http://localhost:5002/api/docs
```

Da Swagger è possibile consultare gli endpoint, i parametri, le risposte e
provare direttamente le richieste.

La specifica OpenAPI in formato JSON è disponibile su:

```text
http://localhost:5002/api/v1/openapi.json
```

In produzione:

```text
https://f1-stats-5v93.onrender.com/api/docs
https://f1-stats-5v93.onrender.com/api/v1/openapi.json
```

Dalla versione `1.1.0`, i contenuti storici delle analisi (`risultatiGara`,
`risultatiQualifica`, `notaBene`, `passoGara` e `gestioneGomme`) sono oggetti
separati per stagione, con chiavi come `2023`, `2024` e `2025`. La chiave
`generale` viene usata soltanto quando una sintesi non appartiene a un singolo
anno.

## Avvio del backend

Dalla cartella `backend`:

```bash
npm install
npm run dev
```

Il server locale viene avviato su `http://localhost:5002`.

## Comandi utili

Eseguire i test del backend:

```bash
npm test
```

Controllare i dati presenti nel database:

```bash
npm run verify-db
```

Importare o aggiornare nel database i contenuti di
`data/dati-iniziali.json`:

```bash
npm run seed
```

Registrare definitivamente nel database i dati del file
`data/aggiornamento-gp.json` dopo un Gran Premio:

```bash
npm run gp -- --controlla
npm run gp
```

Impostare il Gran Premio attualmente pubblicato dalle API:

```bash
npm run set-current -- slug-del-gran-premio
```

Le impostazioni per il collegamento a MongoDB e per la porta del server si
trovano nel file `.env`, da creare prendendo come riferimento `.env.example`.

## Pubblicazione su Render

Il progetto è configurato per essere pubblicato come un solo Web Service:
durante la build Render compila il frontend React, poi il backend Express serve
sia le API sia i file presenti in `frontend/dist`.

1. Pubblicare il repository su GitHub, GitLab o Bitbucket.
2. In Render selezionare **New → Blueprint** e collegare il repository.
3. Render leggerà automaticamente il file `render.yaml`.
4. Inserire `MONGO_URL` come variabile segreta usando la stringa di connessione
   del database MongoDB Atlas.
5. Avviare il deploy e controllare `/api/health` e `/api/docs` sull'indirizzo
   assegnato da Render.

Non bisogna inserire credenziali MongoDB nel repository. Render assegna
automaticamente `PORT`, mentre in produzione il server usa `0.0.0.0` e serve il
frontend compilato.

Docker non è necessario per questo deploy: il runtime Node nativo di Render è
sufficiente e riduce i file e i passaggi da mantenere. Un Dockerfile avrebbe
senso in seguito soltanto se servissero dipendenze di sistema particolari o la
stessa immagine dovesse essere distribuita anche su altre piattaforme.
