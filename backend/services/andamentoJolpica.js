const BASE_URL = "https://api.jolpi.ca/ergast/f1";
const DURATA_CACHE_MS = 30 * 60 * 1000;
const INTERVALLO_RICHIESTE_MS = 275;
const TIMEOUT_MS = 2000;

const cachePiloti = new Map();
let codaRichieste = Promise.resolve();
let ultimaRichiesta = 0;

const nomiCircuiti = {
  albert_park: "Melbourne",
  shanghai: "Shanghai",
  suzuka: "Suzuka",
  miami: "Miami",
  villeneuve: "Montréal",
  monaco: "Monaco",
  catalunya: "Barcellona",
  red_bull_ring: "Spielberg",
  silverstone: "Silverstone",
  spa: "Spa",
  hungaroring: "Budapest",
  zandvoort: "Zandvoort",
  monza: "Monza",
  madring: "Madrid",
  baku: "Baku",
  marina_bay: "Singapore",
  americas: "Austin",
  rodriguez: "Messico",
  interlagos: "Interlagos",
  vegas: "Las Vegas",
  losail: "Lusail",
  yas_marina: "Yas Marina",
};

const fonteJolpica = Object.freeze({
  nome: "Jolpica F1 API",
  url: "https://api.jolpi.ca/ergast/f1/",
});

function attendi(millisecondi) {
  return new Promise((risolvi) => setTimeout(risolvi, millisecondi));
}

async function eseguiRichiesta(percorso) {
  const attesa = Math.max(
    0,
    INTERVALLO_RICHIESTE_MS - (Date.now() - ultimaRichiesta),
  );

  if (attesa > 0) await attendi(attesa);
  ultimaRichiesta = Date.now();

  const risposta = await fetch(`${BASE_URL}${percorso}`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "F1Stats/1.0.0",
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });

  if (!risposta.ok) {
    throw new Error(`Jolpica ha risposto con HTTP ${risposta.status}`);
  }

  return risposta.json();
}

function richiedi(percorso) {
  const operazione = () => eseguiRichiesta(percorso);
  const risultato = codaRichieste.then(operazione, operazione);
  codaRichieste = risultato.catch(() => undefined);
  return risultato;
}

function posizioneNumerica(valore) {
  const posizione = Number.parseInt(valore, 10);
  return Number.isInteger(posizione) && posizione > 0 ? posizione : null;
}

function etichettaGara(gara) {
  const circuitoId = gara.Circuit?.circuitId;

  if (circuitoId && nomiCircuiti[circuitoId]) {
    return nomiCircuiti[circuitoId];
  }

  return String(gara.raceName || "Gran Premio")
    .replace(/\s+Grand Prix$/i, "")
    .trim();
}

function gareDallaRisposta(risposta) {
  return risposta?.MRData?.RaceTable?.Races || [];
}

function costruisciEventi(risultati, qualifiche) {
  const qualificaPerRound = new Map(
    gareDallaRisposta(qualifiche).map((gara) => [
      Number(gara.round),
      gara.QualifyingResults?.[0],
    ]),
  );

  return gareDallaRisposta(risultati)
    .map((gara) => {
      const round = Number(gara.round);
      const risultato = gara.Results?.[0];
      const qualifica = qualificaPerRound.get(round);

      return {
        round,
        etichetta: etichettaGara(gara),
        gara: posizioneNumerica(risultato?.position),
        qualifica: posizioneNumerica(qualifica?.position),
      };
    })
    .filter((evento) => Number.isInteger(evento.round))
    .sort((primo, secondo) => primo.round - secondo.round);
}

async function caricaEventiPilota(stagione, pilotaSlug) {
  const chiave = `${stagione}:${pilotaSlug}`;
  const elementoCache = cachePiloti.get(chiave);

  if (elementoCache && elementoCache.scadenza > Date.now()) {
    return elementoCache.dati;
  }

  const percorsoBase = `/${stagione}/drivers/${encodeURIComponent(pilotaSlug)}`;
  const promessa = Promise.all([
    richiedi(`${percorsoBase}/results.json?limit=100`),
    richiedi(`${percorsoBase}/qualifying.json?limit=100`),
  ]).then(([risultati, qualifiche]) => ({
    eventi: costruisciEventi(risultati, qualifiche),
    aggiornatoIl: new Date().toISOString(),
  }));

  cachePiloti.set(chiave, {
    dati: promessa,
    scadenza: Date.now() + DURATA_CACHE_MS,
  });

  try {
    const dati = await promessa;
    cachePiloti.set(chiave, {
      dati,
      scadenza: Date.now() + DURATA_CACHE_MS,
    });
    return dati;
  } catch (errore) {
    cachePiloti.delete(chiave);
    throw errore;
  }
}

async function creaAndamentoPilota({ stagione, pilota }) {
  const { eventi, aggiornatoIl } = await caricaEventiPilota(
    stagione,
    pilota.slug,
  );

  return {
    stagione,
    etichette: eventi.map((evento) => evento.etichetta),
    qualifica: [
      {
        nome: pilota.codice,
        valori: eventi.map((evento) => evento.qualifica),
      },
    ],
    gara: [
      {
        nome: pilota.codice,
        valori: eventi.map((evento) => evento.gara),
      },
    ],
    fonte: fonteJolpica,
    aggiornatoIl,
  };
}

async function creaAndamentoScuderia({ stagione, piloti }) {
  const datiPiloti = await Promise.all(
    piloti.map(async (pilota) => ({
      pilota,
      ...(await caricaEventiPilota(stagione, pilota.slug)),
    })),
  );
  const eventiPerRound = new Map();

  datiPiloti.forEach(({ eventi }) => {
    eventi.forEach((evento) => {
      if (!eventiPerRound.has(evento.round)) {
        eventiPerRound.set(evento.round, evento.etichetta);
      }
    });
  });

  const round = [...eventiPerRound.keys()].sort((primo, secondo) => primo - secondo);
  const creaSerie = (campo) =>
    datiPiloti.map(({ pilota, eventi }) => {
      const eventiIndicizzati = new Map(
        eventi.map((evento) => [evento.round, evento]),
      );

      return {
        nome: pilota.codice,
        valori: round.map((numero) => eventiIndicizzati.get(numero)?.[campo] ?? null),
      };
    });

  return {
    stagione,
    etichette: round.map((numero) => eventiPerRound.get(numero)),
    qualifica: creaSerie("qualifica"),
    gara: creaSerie("gara"),
    fonte: fonteJolpica,
    aggiornatoIl: datiPiloti
      .map((dati) => dati.aggiornatoIl)
      .sort()
      .at(-1),
  };
}

module.exports = {
  creaAndamentoPilota,
  creaAndamentoScuderia,
  costruisciEventi,
};
