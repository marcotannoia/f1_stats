const FORMATO_SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/

function convalidaSlug(richiesta, risposta, next) {
  const { slug } = richiesta.params

  if (!slug || slug.length > 80 || !FORMATO_SLUG.test(slug)) {
    return risposta.status(400).json({ messaggio: "Identificativo non valido" })
  }

  next()
}

module.exports = convalidaSlug
