type Props = { isAdmin: boolean; onHome: () => void; onRequest: () => void; onAdmin: () => void };

export default function Navigation({ isAdmin, onHome, onRequest, onAdmin }: Props) {

  return (
    <header className="site-navbar sticky-top">
      <style>{`@keyframes navDomainFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <nav className="container d-flex flex-wrap align-items-center justify-content-between gap-3 py-3">
        <button className="navbar-brand btn btn-link p-0 text-decoration-none" type="button" onClick={onHome}>
          Lytsites<span className="text-primary">{['.', 'c', 'o', 'm'].map((char, index) => (<span key={`${char}-${index}`} style={{ display: "inline-block", opacity: 0, animation: `navDomainFadeIn 420ms ease ${index * 120}ms forwards` }}>{char}</span>))}</span>
        </button>
        <div className="d-flex flex-wrap align-items-center gap-3">
          {/* <button className="btn btn-link p-0 nav-link" type="button" onClick={onHome}>Work</button> */}
          {/* <button className="btn btn-link p-0 nav-link" type="button" onClick={onRequest}>Request a site</button> */}
          {isAdmin && <button className="btn btn-link p-0 nav-link" type="button" onClick={onAdmin}>Profile</button>}
        </div>
      </nav>
    </header>
  );
}
