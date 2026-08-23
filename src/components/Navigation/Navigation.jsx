import {
  NavLink,
} from 'react-router-dom'

import './Navigation.css'

function Navigation() {
  function getLinkClass({
    isActive,
  }) {
    return isActive
      ? 'navigation-link active'
      : 'navigation-link'
  }

  return (
    <nav className="navigation">
      <div className="navigation-inner">
        <NavLink
          to="/testokter"
          className="navigation-logo"
        >
          Skitesting
        </NavLink>

        <div className="navigation-links">
          <NavLink
            to="/testokter"
            className={getLinkClass}
          >
            Testøkter
          </NavLink>

          <NavLink
            to="/historikk"
            className={getLinkClass}
          >
            Historikk
          </NavLink>

          <NavLink
            to="/analyse"
            className={getLinkClass}
          >
            Analyse
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default Navigation