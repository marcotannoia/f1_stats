# Backend F1 Stats

Il backend espone API REST per consultare i piloti, le scuderie, le gare e le
analisi contenute nel workbook `gpk_completato.xlsx`.

## Struttura

```text
backend/
├── config/          collegamento a MongoDB
├── controllers/     logica delle risposte HTTP
├── data/            dati iniziali estratti dal workbook
├── middleware/      gestione delle funzioni asincrone e degli errori
├── models/          schemi Mongoose
├── routes/          endpoint Express
├── scripts/         importazione e verifica del database
├── app.js           configurazione dell'applicazione Express
└── server.js        avvio del server
```

## Collezioni MongoDB

```text
piloti              22 documenti
scuderie            11 documenti
gare                12 documenti
analisiGare         264 documenti
analisiScuderie     132 documenti
```

`analisiScuderie` è separata da `analisiGare` perché il workbook contiene
analisi distinte per i piloti e per le scuderie.

## Comandi

```bash
npm run gp
npm run set-current -- olanda-zandvoort
npm run seed
npm run verify-db
npm run dev
```

Il comando `seed` usa aggiornamenti con `upsert`: può essere eseguito più volte
senza duplicare i documenti. Non riporta indietro il calendario dopo che una
gara è stata chiusa e non sovrascrive lo storico o il campo
`aggiornamentiInArrivo`.

Il server usa `http://localhost:5002`, perché su macOS la porta 5000 può essere
occupata dal servizio AirPlay.

`set-current` modifica soltanto lo stato editoriale delle gare: pubblica lo slug
indicato come `attuale` e rende non accessibili le altre gare non concluse. Non
modifica analisi, risultati o classifiche.

## API pubblica v1

```text
GET /api/v1
GET /api/v1/health
GET /api/v1/home
GET /api/v1/piloti
GET /api/v1/piloti/:pilotaSlug
GET /api/v1/scuderie
GET /api/v1/scuderie/:scuderiaSlug
GET /api/v1/gare
GET /api/v1/gare/attuale
GET /api/v1/gare/:garaSlug
GET /api/v1/classifiche/piloti
GET /api/v1/classifiche/scuderie
GET /api/v1/gare/:garaSlug/piloti/:pilotaSlug/analisi
GET /api/v1/gare/:garaSlug/scuderie/:scuderiaSlug/analisi
```

Le API sono pubbliche, prive di credenziali e di sola lettura. Restituiscono
soltanto il Gran Premio marcato come `attuale`. Il calendario futuro e le
analisi delle altre gare restano nel database, ma non sono accessibili dagli
endpoint pubblici. Una richiesta con lo slug di una gara diversa da quella
attuale restituisce `404 GARA_NON_ACCESSIBILE`.

Esempi:

```text
GET /api/v1/piloti/norris
GET /api/v1/scuderie/mclaren
GET /api/v1/gare/attuale
```

La documentazione Swagger e la specifica OpenAPI sono disponibili su:

```text
GET /api/docs
GET /api/v1/openapi.json
```

Le risposte v1 non espongono `_id`, `etichettaExcel` o altri campi interni di
MongoDB. Tutti gli errori includono un codice stabile e un `requestId`.

## Sicurezza dell'API pubblica

- sono consentiti solo `GET`, `HEAD` e `OPTIONS`;
- CORS e pubblico senza credenziali;
- Helmet configura gli header di sicurezza;
- il rate limit si applica a tutte le richieste `/api`;
- slug e query string sono convalidati;
- le risposte sono costruite con una lista esplicita di campi pubblici;
- le gare future non vengono selezionate come ripiego;
- Swagger usa una Content Security Policy dedicata;
- `/api/v1/health` non viene memorizzato in cache.

## Test

```bash
npm test
```

I test verificano la selezione della sola gara attuale, l'assenza di campi
MongoDB nelle risposte pubbliche, il blocco dei metodi di scrittura, la
validazione e la disponibilita della documentazione OpenAPI.

## Aggiornamento dopo un Gran Premio

Ogni analisi conserva un array `storicoEdizioni`. A gara conclusa questo array
riceve un record strutturato con stagione, posizione in gara e qualifica, nota
sul risultato, passo, gomme e affidabilità. Se lo stesso aggiornamento viene
eseguito di nuovo, il record di quella stagione viene sostituito e non duplicato.

Dalla cartella principale del progetto si usa sempre lo stesso comando:

```bash
npm run gp
```

Se `backend/data/aggiornamento-gp.json` non esiste, il comando lo genera per il
GP attualmente visibile. Il file contiene già tutti i piloti, tutte le scuderie
e le classifiche correnti. Bisogna quindi:

1. inserire posizione di gara e qualifica per tutti i piloti;
2. aggiornare le due classifiche complete;
3. aggiungere, quando disponibili, note, passo gara, gomme e affidabilità;
4. impostare `"pronto": true`;
5. rilanciare `npm run gp`.

Lo script controlla che nessun pilota o elemento della classifica sia assente,
costruisce automaticamente i risultati delle scuderie, registra lo storico,
aggiorna le classifiche, chiude il GP corrente e pubblica il successivo in base
all'ordine del calendario. I grafici scelgono automaticamente la stagione più
recente che possiede risultati.

Prima di scrivere nel database si può eseguire un controllo completo:

```bash
npm run gp -- --controlla
```

Dopo l'aggiornamento, il file compilato viene conservato in
`backend/data/archivio-gp/`. Il comando non usa API esterne: i contenuti restano
quelli inseriti e verificati manualmente.

Per rigenerare volontariamente il modulo corrente:

```bash
npm run gp -- --prepara --sovrascrivi
```
