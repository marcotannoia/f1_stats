function cachePubblica(secondi = 60) {
  return function configuraCache(richiesta, risposta, next) {
    risposta.set(
      "Cache-Control",
      `public, max-age=${secondi}, stale-while-revalidate=${secondi * 5}`,
    );
    next();
  };
}

module.exports = cachePubblica;
