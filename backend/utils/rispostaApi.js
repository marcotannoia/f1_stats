function inviaErrore(risposta, stato, codice, messaggio) {
  return risposta.status(stato).json({
    errore: {
      codice,
      messaggio,
      requestId: risposta.locals.requestId,
    },
  });
}

module.exports = { inviaErrore };
