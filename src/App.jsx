import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Blanchisserie from './pages/Blanchisserie'
import Pressing from './pages/Pressing'
import LocationLinge from './pages/LocationLinge'
import Professionnels from './pages/Professionnels'
import Contact from './pages/Contact'
import MentionsLegales from './pages/MentionsLegales'
import PolitiqueConfidentialite from './pages/PolitiqueConfidentialite'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blanchisserie" element={<Blanchisserie />} />
        <Route path="/pressing" element={<Pressing />} />
        <Route path="/location-linge" element={<LocationLinge />} />
        <Route path="/professionnels" element={<Professionnels />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
        <Route path="/politique-confidentialite" element={<PolitiqueConfidentialite />} />
      </Routes>
      <Footer />
    </Router>
  )
}
