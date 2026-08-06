const FORMATO_SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/;

function convalidaParametriSlug(...nomiParametri) {
  return function convalida(richiesta, risposta, next) {
    for (const nome of nomiParametri) {
      const valore = richiesta.params[nome];

      if (!valore || valore.length > 80 || !FORMATO_SLUG.test(valore)) {
        return risposta.status(400).json({
          errore: {
            codice: "IDENTIFICATORE_NON_VALIDO",
            messaggio: `Il parametro ${nome} non e valido`,
            requestId: risposta.locals.requestId,
          },
        });
      }
    }

    next();
  };
}

module.exports = convalidaParametriSlug;
