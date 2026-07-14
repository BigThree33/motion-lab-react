import { NavLink, Outlet } from 'react-router'
import { pageRoutes } from './routes/pageRoutes'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Animation pages">
        <div className="app-brand">
          <span className="app-brand__mark" aria-hidden="true" />
          <div>
            <strong>Motion Lab</strong>
            <span>CSS / GSAP / ScrollTrigger</span>
          </div>
        </div>

        <nav className="app-nav">
          {pageRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) =>
                isActive ? 'app-nav__link app-nav__link--active' : 'app-nav__link'
              }
            >
              {route.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="app-stage">
        <Outlet />
      </main>
    </div>
  )
}

export default App
