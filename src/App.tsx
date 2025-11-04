import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Game from './pages/Game'
import Generate from './pages/Generate'
import './App.css'

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Game />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
