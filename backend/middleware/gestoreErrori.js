function gestoreErrori(errore, richiesta, risposta, next) {
  if (risposta.headersSent) {
    return next(errore);
  }

  const dettaglio = `${richiesta.method} ${richiesta.originalUrl}: ${errore.message}`;
  const stato = errore instanceof URIError ? 400 : 500;

  if (process.env.NODE_ENV === "production") {
    console.error(dettaglio);
  } else {
    console.error(dettaglio, errore.stack);
  }

  const messaggio =
    stato === 400
      ? "Richiesta non valida"
      : "Si è verificato un errore interno al server";

  if (richiesta.originalUrl.startsWith("/api/v1")) {
    return risposta.status(stato).json({
      errore: {
        codice: stato === 400 ? "RICHIESTA_NON_VALIDA" : "ERRORE_INTERNO",
        messaggio,
        requestId: risposta.locals.requestId,
      },
    });
  }

  risposta.status(stato).json({ messaggio });
}

module.exports = gestoreErrori;
