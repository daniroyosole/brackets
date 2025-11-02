import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navigation from './components/layout/Navigation'
import Game from './pages/Game'
import Generate from './pages/Generate'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/generate" element={<Generate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
