function gestisciFunzioneAsincrona(funzione) {
  return function (richiesta, risposta, next) {
    Promise.resolve(funzione(richiesta, risposta, next)).catch(next);
  };
}

module.exports = gestisciFunzioneAsincrona;
