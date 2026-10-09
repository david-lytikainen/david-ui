type Props = { isAdmin: boolean; onHome: () => void; onRequest: () => void; onAdmin: () => void };

export default function Navigation({ isAdmin, onHome, onRequest, onAdmin }: Props) {
  return <header className="site-navbar sticky-top">
    <nav className="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3" aria-label="Main navigation">
      <button className="navbar-brand btn btn-link p-0 text-decoration-none" type="button" onClick={onHome}>DAVID</button>
      <div className="d-flex flex-wrap align-items-center gap-3">
        <button className="btn btn-link p-0 nav-link" type="button" onClick={onHome}>Work</button>
        <button className="btn btn-link p-0 nav-link" type="button" onClick={onRequest}>Request a site</button>
        <button className="btn btn-link p-0 nav-link" type="button" onClick={onAdmin}>{isAdmin ? "Admin" : "Sign in"}</button>
      </div>
    </nav>
  </header>;
}
