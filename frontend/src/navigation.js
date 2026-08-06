export function vaiA(percorso) {
  window.history.pushState({}, '', percorso)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
