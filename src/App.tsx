import { CSSProperties, useEffect, useLayoutEffect, useRef, useState } from "react";

import { authApi, portfolioApi, PortfolioSite, User } from "./api";
import AdminPage from "./components/AdminPage";
import AuthPanel from "./components/AuthPanel";
import Navigation from "./components/Navigation";
import RequestForm from "./components/RequestForm";
import RequestPage from "./components/RequestPage";

type View = "home" | "admin" | "login" | "request";
function readRoute(): { view: View; requestNumber: string } {
  const match = window.location.pathname.match(/^\/request\/(\d{6}|LYT-\d{9})\/?$/);
  if (match) return { view: "request", requestNumber: match[1] };
  if (window.location.pathname === "/admin") return { view: "admin", requestNumber: "" };
  if (window.location.pathname === "/admin/sign-in") return { view: "login", requestNumber: "" };
  return { view: "home", requestNumber: "" };
}

export default function App() {
  const isMobile = window.innerWidth < 768;
  const route = readRoute();
  const requestRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState<View>(route.view);
  const [requestNumber, setRequestNumber] = useState(route.requestNumber);
  const [sites, setSites] = useState<PortfolioSite[]>([]);
  const [activeSite, setActiveSite] = useState(0);
  const [token, setToken] = useState("");
  const [user, setUser] = useState<User | null>(null);





  const [cometWidth, setCometWidth] = useState(0);
  const [left1, setLeft1] = useState(0);
  const [top1, setTop1] = useState(0);
  const [left2, setLeft2] = useState(0);
  const [top2, setTop2] = useState(0);
  const [cometAngle, setCometAngle] = useState(0);
  useLayoutEffect(() => {
    setCometWidth(window.innerHeight * .15);
    const l1 = .75 * window.innerWidth, t1 = .40 * window.innerHeight;
    let l2 = .50 * window.innerWidth, t2 = .15 * window.innerHeight;
    if (isMobile) {
      l2 = .30 * window.innerWidth;
      t2 = .20 * window.innerHeight;
    }
    setLeft1(l1); setTop1(t1); setLeft2(l2); setTop2(t2);

    const dx = l1 - l2;
    const dy = t1 - t2;
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    setCometAngle(angle - 180);
  }, []);
  const [showSite1, setShowSite1] = useState(false);

  useEffect(() => {
    if (showSite1)
      document.body.classList.add("zoom");
    else
      document.body.classList.remove("zoom");
  }, [showSite1]);





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
      <main className="container">
        {view === "home" ? (
          <>
            <section className="py-5 my-5 d-flex align-items-end">
              <div>
                <h1 className="m-0">Need a</h1>
                <h1>website?</h1>
                <p className="text-muted">We bring your ideas to light</p>
                <button className="btn btn-primary" type="button" onClick={showRequest}>Request a website</button>
              </div>
            </section>


            <div className="d-block" style={{ height: "200px" }}></div>

            <div className="comet" style={{ "--cometWidth": `${cometWidth}px`, "--left1": `${left1}px`, "--top1": `${top1}px`, "--left2": `${left2}px`, "--top2": `${top2}px`, "--cometAngle": `${cometAngle}deg` } as CSSProperties}></div>
            <div className="star1" onClick={() => setShowSite1(!showSite1)}></div>
            <div className="star2"></div>
            <div className="star3"></div>



            {/* <section className="py-5 mt-5" id="work">
              {sites.length ? (
                <>
                <div ref={targetRef} className="row g-3 work-carousel" onTouchStart={startSwipe} onTouchEnd={finishSwipe} onScroll={(event) => {
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
                <div className="work-swipe-hint"><span>Swipe to explore</span><i className="fa-solid fa-arrow-right" aria-hidden="true" /></div>
                </>
              ) : (
                <div className="empty">Selected work is coming into view.</div>
              )}
            </section> */}
            {/* {sites.length ? (
              <article className={showSite1 ? "site1 show col-12" : "site1 col-12"} key={sites[0].id}>
                <img className="h-100 w-100" src={sites[0].screenshotUrl} alt="Website homepage preview" />
                <a href={sites[0].siteUrl} target="_blank" rel="noreferrer" title="Open site"><i className="fa-solid fa-arrow-up-right-from-square" /></a>
              </article>
            ) : (<div></div>)} */}


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
