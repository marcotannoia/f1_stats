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
