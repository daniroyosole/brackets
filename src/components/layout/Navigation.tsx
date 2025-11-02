import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

const Navigation = () => {
  const location = useLocation()
  
  return (
    <nav className="main-nav">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Play
      </Link>
      <Link to="/generate" className={location.pathname === '/generate' ? 'active' : ''}>
        Generate
      </Link>
    </nav>
  )
}

export default Navigation

