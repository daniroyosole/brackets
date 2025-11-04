import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()
  
  return (
    <nav className="main-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Jugar
      </Link>
      <Link to="/generate" className={location.pathname === '/generate' ? 'active' : ''}>
        Generar
      </Link>
    </nav>
  )
}

export default Navigation

