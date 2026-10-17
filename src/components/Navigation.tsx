type Props = { isAdmin: boolean; onHome: () => void; onRequest: () => void; onAdmin: () => void };

export default function Navigation({ isAdmin, onHome, onRequest, onAdmin }: Props) {

  return (
    <header className="site-navbar sticky-top">
      <style>{`@keyframes test { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <nav className="container d-flex align-items-center justify-content-center py-3">
        <button className="navbar-brand btn btn-link p-0 text-decoration-none" type="button" onClick={onHome}>
          <span>{['L', 'y', 't', 's', 'i', 't', 'e', 's'].map((char, index) => (<span key={`${char}-${index}`} style={{ display: "inline-block", opacity: 0, animation: `test 600ms ease-in-out ${index * 100}ms forwards` }}>{char}</span>))}</span>
          <span className="text-primary">{['.', 'c', 'o', 'm'].map((char, index) => (<span key={`${char}-${index}`} style={{ display: "inline-block", opacity: 0, animation: `test 600ms ease-in-out ${index * 160}ms forwards` }}>{char}</span>))}</span>
        </button>
        {isAdmin && <button className="btn btn-link p-0 ms-2 nav-link" type="button" onClick={onAdmin}>Admin</button>}
      </nav>
    </header>
  );
}
