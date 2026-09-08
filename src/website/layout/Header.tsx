import { Link } from "react-router-dom";

import Navigation from "./Navigation";

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link
          className="site-brand"
          to="/"
          aria-label="Pioneer Legacy Works home"
        >
          <span className="site-brand__mark" aria-hidden="true">
            P
          </span>

          <span className="site-brand__text">
            <span className="site-brand__name">Pioneer</span>
            <span className="site-brand__subtitle">Legacy Works</span>
          </span>
        </Link>

        <Navigation />
      </div>
    </header>
  );
}

export default Header;
