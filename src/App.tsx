import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";

import { authApi, portfolioApi, PortfolioSite, User } from "./api";
import AdminPage from "./components/AdminPage";
import AuthPanel from "./components/AuthPanel";
import Navigation from "./components/Navigation";
import RequestForm from "./components/RequestForm";
import RequestPage from "./components/RequestPage";

type View = "home" | "admin" | "login" | "request";
function readRoute(): { view: View; requestNumber: string } {
  const match = window.location.pathname.match(/^\/request\/(\d{6})\/?$/);
  if (match) return { view: "request", requestNumber: match[1] };
  if (window.location.pathname === "/admin") return { view: "admin", requestNumber: "" };
  if (window.location.pathname === "/admin/sign-in") return { view: "login", requestNumber: "" };
  return { view: "home", requestNumber: "" };
}

export default function App() {
  const route = readRoute();
  const requestRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View>(route.view);
  const [requestNumber, setRequestNumber] = useState(route.requestNumber);
  const [sites, setSites] = useState<PortfolioSite[]>([]);
  const [activeSite, setActiveSite] = useState(0);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);

  const [angle, setAngle] = useState(0);
  const targetRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const updateAngle = () => {
      const elt = targetRef.current?.getBoundingClientRect();
      if (!elt) return;
      const angle = (elt.top + elt.height / 2 - window.innerHeight / 2) / 25;
      if (angle < 0) return;
      setAngle(angle);
    };
    updateAngle();
    window.addEventListener("scroll", updateAngle, { passive: true });
    window.addEventListener("resize", updateAngle);
    return () => {
      window.removeEventListener("scroll", updateAngle);
      window.removeEventListener("resize", updateAngle);
    };
  }, [sites, view]);

  useEffect(() => {
    void portfolioApi.list().then(setSites).catch(() => setSites([]));
  }, []);
  useEffect(() => {
    const stored = localStorage.getItem("david-token");
    if (!stored) return;
    void authApi.validate(stored).then((nextUser) => {
      setToken(stored);
      setUser(nextUser);
    }).catch(() => localStorage.removeItem("david-token"));
  }, []);
  useEffect(() => {
    const popState = () => {
      const next = readRoute();
      setView(next.view);
      setRequestNumber(next.requestNumber);
    };
    window.addEventListener("popstate", popState);
    return () => window.removeEventListener("popstate", popState);
  }, []);
  const navigate = (nextView: View, path: string, nextRequestNumber = "") => {
    window.history.pushState({}, "", path);
    setView(nextView);
    setRequestNumber(nextRequestNumber);
  };
  const showHome = () => navigate("home", "/");
  const moveSite = (direction: -1 | 1) => {
    const nextSite = Math.max(0, Math.min(sites.length - 1, activeSite + direction));
    targetRef.current?.children[nextSite]?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    setActiveSite(nextSite);
  };
  const showRequest = () => {
    showHome();
    window.setTimeout(() => requestRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
  };
  const openRequest = (number: string) => navigate("request", `/request/${number}`, number);
  const authed = (nextToken: string, nextUser: User) => {
    localStorage.setItem("david-token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
    navigate("admin", "/admin");
  };
  const logout = () => {
    localStorage.removeItem("david-token");
    setToken("");
    setUser(null);
    showHome();
  };
  return (
    <div className="min-vh-100">
      <Navigation isAdmin={Boolean(user)} onHome={showHome} onRequest={showRequest} onAdmin={() => navigate(user ? "admin" : "login", user ? "/admin" : "/admin/sign-in")} />
      <main className="container pb-5">
        {view === "home" ? (
          <>
            <section className="hero d-flex align-items-end">
              <div className="hero-content">
                <h1 className="m-0">Need a</h1>
                <h1>website?</h1>
                <p className="text-muted">I build them.</p>
                <button className="btn btn-primary" type="button" onClick={showRequest}>Request a website</button>
              </div>
            </section>
            <section className="py-5" id="work">
              <h2>My Work</h2>
              {sites.length ? (
                <div ref={targetRef} className="row g-3 work-carousel" onScroll={(event) => {
                  const slides = Array.from(event.currentTarget.children) as HTMLElement[];
                  const carouselLeft = event.currentTarget.getBoundingClientRect().left;
                  const current = slides.reduce((nearest, slide, index) => Math.abs(slide.getBoundingClientRect().left - carouselLeft) < Math.abs(slides[nearest].getBoundingClientRect().left - carouselLeft) ? index : nearest, 0);
                  setActiveSite(current);
                }}>
                  {sites.map((site) => (
                    <article className="col-12 col-md-4 work-slide" key={site.id} style={{ perspective: "200px" }}>
                      <div className="card" style={{ background: "#0d1a2b", transform: `rotateX(${angle}deg)` }}>
                        <div className="ratio work-image" style={{ "--bs-aspect-ratio": "60.5%" } as CSSProperties}>
                          <img className="h-100 w-100 object-fit-cover" src={site.screenshotUrl} alt="Website homepage preview" />
                          <a className="work-open-mobile" href={site.siteUrl} target="_blank" rel="noreferrer" aria-label={`Open ${site.name}`} title="Open site"><i className="fa-solid fa-arrow-up-right-from-square" /></a>
                        </div>
                        <div className="card-body d-none d-md-flex justify-content-between align-items-center py-3">
                          <h5 className="mb-0 text-white">{site.name}</h5>
                          <a className="btn btn-outline-info btn-sm" href={site.siteUrl} target="_blank" rel="noreferrer">Open site <i className="fa-solid fa-arrow-up-right-from-square ms-1" /></a>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                {sites.length > 1 ? <div className="work-controls d-flex d-md-none align-items-center justify-content-center gap-3 mt-3"><button className="btn btn-outline-info" type="button" onClick={() => moveSite(-1)} disabled={activeSite === 0} aria-label="Previous website"><i className="fa-solid fa-arrow-left" /></button><span className="small text-muted">Swipe to explore · {activeSite + 1} / {sites.length}</span><button className="btn btn-outline-info" type="button" onClick={() => moveSite(1)} disabled={activeSite === sites.length - 1} aria-label="Next website"><i className="fa-solid fa-arrow-right" /></button></div> : null}
              ) : (
                <div className="empty">Selected work is coming into view.</div>
              )}
            </section>
            <div ref={requestRef}>
              <RequestForm onCreated={openRequest} />
            </div>
          </>
        ) : null}
        {view === "login" ? <AuthPanel onAuthed={authed} /> : null}
        {view === "admin" ? user && token ? <AdminPage token={token} onOpenRequest={openRequest} onLogout={logout} /> : <AuthPanel onAuthed={authed} /> : null}
        {view === "request" ? <RequestPage requestNumber={requestNumber} token={token} onBack={showHome} /> : null}
      </main>
    </div>
  );
}
