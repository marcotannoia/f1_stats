import './App.css'
import Footer from './components/Footer.jsx'
import HomePage from './pages/HomePage.jsx'
import PilotaPage from './pages/PilotaPage.jsx'
import ScuderiaPage from './pages/ScuderiaPage.jsx'
import PaginaNonTrovata from './pages/PaginaNonTrovata.jsx'
import usePercorso from './hooks/usePercorso.js'

function App() {
  const percorso = usePercorso()
  const pilota = percorso.match(/^\/piloti\/([^/]+)$/)
  const scuderia = percorso.match(/^\/scuderie\/([^/]+)$/)

  let pagina = <PaginaNonTrovata />

  if (percorso === '/') {
    pagina = <HomePage />
  } else if (pilota) {
    pagina = <PilotaPage slug={decodeURIComponent(pilota[1])} />
  } else if (scuderia) {
    pagina = <ScuderiaPage slug={decodeURIComponent(scuderia[1])} />
  }

  return (
    <div className="app-shell">
      <main>{pagina}</main>
      <Footer />
    </div>
  )
}

export default App
