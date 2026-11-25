import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  PACKAGES, GEMS, PLACES, TRIP_TYPES, CROWD_LABELS,
  OFFERS, SERVICES, STEPS, STATS, TESTIMONIALS,
} from "./data.js";
import { HERO, RIVER, GRASS } from "./images.js";
import { Background, GrassFooter } from "./Scenery.jsx";
import Preloader from "./Preloader.jsx";
import Icon from "./Icons.jsx";
import TravelMap from "./TravelMap.jsx";
import TripTracker from "./TripTracker.jsx";
import AIAssistant from "./AIAssistant.jsx";
import { useCountUp, useInView, useScrolled, useStoredState } from "./hooks.js";

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const PRELOAD = [HERO, RIVER, GRASS];
const scrollToId = (id, block = "start") => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block });

/* ---------- small helpers ---------- */
function Reveal({ children, delay = 0, className = "" }) {
  const [ref, seen] = useInView();
  return (
    <div ref={ref} className={`reveal ${seen ? "in" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function SectionHead({ eyebrow, title, text }) {
  return (
    <Reveal className="section-head">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </Reveal>
  );
}

function Stat({ value, suffix, label, decimals }) {
  const [ref, seen] = useInView();
  const n = useCountUp(value, seen);
  return (
    <div ref={ref} className="stat">
      <strong>{n.toFixed(decimals)}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

function Modal({ onClose, children }) {
  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="x" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        {children}
      </div>
    </div>
  );
}

function Drawer({ title, icon, onClose, children }) {
  return (
    <div className="overlay drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3><Icon name={icon} size={20} /> {title}</h3>
          <button className="x static" onClick={onClose} aria-label="Close"><Icon name="close" size={20} /></button>
        </div>
        <div className="drawer-body">{children}</div>
      </aside>
    </div>
  );
}

/* ---------- Floating nav ---------- */
function Header({ scrolled, active, setActive, wishCount, cartCount, user, onLogin, onWishlist, onCheckout }) {
  const [open, setOpen] = useState(false);
  const go = (id) => { setActive(id); setOpen(false); };
  const links = [
    ["flights", "Flights", "plane"],
    ["cabs", "Cabs", "car"],
    ["holidays", "Holidays", "mountain"],
  ];
  return (
    <header className={`header ${scrolled ? "scrolled" : ""} ${open ? "open" : ""}`}>
      <a className="brand" href="#top">
        <span className="brand-mark"><Icon name="mountain" size={18} /></span>
        <span className="brand-name">Yatra <em>Ventures</em></span>
      </a>

      <nav className="nav">
        {links.map(([id, label, icon]) => (
          <a key={id} href="#search" className={active === id ? "active" : ""} onClick={() => go(id)}>
            <Icon name={icon} size={16} /> {label}
          </a>
        ))}
      </nav>

      <div className="head-actions">
        <button className="ha" onClick={onWishlist} aria-label="Wishlist">
          <Icon name="heart" size={18} /><span>Wishlist</span>
          {wishCount > 0 && <b className="badge">{wishCount}</b>}
        </button>
        <button className="ha" onClick={onCheckout} aria-label="Checkout">
          <Icon name="cart" size={18} /><span>Checkout</span>
          {cartCount > 0 && <b className="badge">{cartCount}</b>}
        </button>
        <button className="btn-pill solid sm" onClick={onLogin}>
          <Icon name="user" size={16} /> {user || "Login"}
        </button>
        <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu">
          <Icon name={open ? "close" : "menu"} size={22} />
        </button>
      </div>
    </header>
  );
}

/* ---------- Search (sits on the right of the hero) ---------- */
function SearchBox({ active, setActive, onSearch }) {
  const [trip, setTrip] = useState("oneway");
  const tabs = [["flights", "Flights", "plane"], ["cabs", "Cabs", "car"], ["holidays", "Holidays", "mountain"]];
  return (
    <form className="search" id="search" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
      <h2 className="search-title">Plan your trip</h2>
      <div className="tabs">
        {tabs.map(([id, label, icon]) => (
          <button type="button" key={id} className={active === id ? "on" : ""} onClick={() => setActive(id)}>
            <Icon name={icon} size={15} /> {label}
          </button>
        ))}
      </div>

      {active === "flights" && (
        <>
          <div className="radios">
            {[["oneway", "One way"], ["round", "Round trip"]].map(([v, l]) => (
              <label key={v}><input type="radio" checked={trip === v} onChange={() => setTrip(v)} /> {l}</label>
            ))}
          </div>
          <div className="fields">
            <label>From<input placeholder="Delhi (DEL)" /></label>
            <label>To<input placeholder="Mumbai (BOM)" /></label>
            <label>Departure<input type="date" /></label>
            {trip === "round" && <label>Return<input type="date" /></label>}
            <label className={trip === "round" ? "full" : ""}>Travellers
              <select defaultValue="1">{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select>
            </label>
          </div>
        </>
      )}

      {active === "cabs" && (
        <div className="fields">
          <label className="full">Pickup<input placeholder="Pickup location" /></label>
          <label className="full">Drop<input placeholder="Drop location" /></label>
          <label>Date<input type="date" /></label>
          <label>Time<input type="time" /></label>
          <label className="full">Cab type
            <select><option>Hatchback</option><option>Sedan</option><option>SUV</option><option>Tempo Traveller</option></select>
          </label>
        </div>
      )}

      {active === "holidays" && (
        <div className="fields">
          <label className="full">Destination<input placeholder="Kashmir, Kerala, Ladakh" /></label>
          <label>Month
            <select>{["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((m) => <option key={m}>{m}</option>)}</select>
          </label>
          <label>Travellers
            <select>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select>
          </label>
          <label className="full">Budget
            <select><option>Any</option><option>Under ₹20,000</option><option>₹20,000 – ₹40,000</option><option>₹40,000+</option></select>
          </label>
        </div>
      )}

      <button className="btn-pill solid search-btn" type="submit">
        <Icon name="search" size={18} /> Search
      </button>
    </form>
  );
}

/* ---------- Cards ---------- */
function PackageCard({ pkg, wished, inCart, onWish, onCart, delay }) {
  return (
    <Reveal delay={delay}>
      <article className="card">
        <div className="card-img">
          <div className="card-photo" style={{ backgroundImage: `url(${pkg.img})` }} />
          <span className="tag">{pkg.tag}</span>
          <button className={"heart" + (wished ? " on" : "")} onClick={() => onWish(pkg.id)} aria-label="Add to wishlist">
            <Icon name="heart" size={18} fill={wished ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="card-body">
          <span className="region"><Icon name="pin" size={14} /> {pkg.region}</span>
          <h3>{pkg.name}</h3>
          <p>{pkg.blurb}</p>
          <div className="card-foot">
            <div><small>{pkg.days} · from</small><strong>{inr(pkg.price)}</strong></div>
            <button className={"btn-pill sm " + (inCart ? "added" : "outline-dark")} onClick={() => onCart(pkg.id)}>
              {inCart ? <><Icon name="check" size={14} /> Added</> : "Add to cart"}
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function GemCard({ gem, saved, onSave, onMap, onAsk, delay }) {
  return (
    <Reveal delay={delay}>
      <article className="card">
        <div className="card-img">
          <div className="card-photo" style={{ backgroundImage: `url(${gem.img})`, backgroundPosition: gem.pos }} />
          <span className="gem-badge"><Icon name="gem" size={12} /> Hidden gem</span>
          <button className={"bookmark" + (saved ? " on" : "")} onClick={() => onSave(gem.id)} aria-label="Bookmark this place">
            <Icon name="bookmark" size={18} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <div className="card-body">
          <span className="region"><Icon name="pin" size={14} /> {gem.region}</span>
          <h3>{gem.name}</h3>
          <p>{gem.blurb}</p>
          <div className="crowd">
            <div className="crowd-bars">{[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= gem.crowd ? "on" : ""} />)}</div>
            <span>{CROWD_LABELS[gem.crowd - 1]}</span>
          </div>
          <div className="gem-meta"><span>Best: {gem.season}</span><span>{gem.days}</span></div>
          <div className="gem-actions">
            <button className="link-btn" onClick={() => onMap(gem.id)}>View on map</button>
            <button className="link-btn" onClick={() => onAsk(`Tell me about ${gem.name}`)}>Ask AI</button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function OfferCard({ offer, delay }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(offer.code); } catch (e) { /* ignore */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <Reveal delay={delay}>
      <div className="offer">
        <h3>{offer.title}</h3>
        <p>{offer.text}</p>
        <div className="coupon">
          <span>{offer.code}</span>
          <button onClick={copy}>{copied ? "Copied" : "Copy code"}</button>
        </div>
      </div>
    </Reveal>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);
  const t = TESTIMONIALS[i];
  return (
    <div className="testi">
      <div key={i} className="testi-card">
        <div className="stars">{[0, 1, 2, 3, 4].map((k) => <Icon key={k} name="star" size={16} fill="currentColor" />)}</div>
        <p>“{t.text}”</p>
        <div className="who"><strong>{t.name}</strong><span>{t.trip}</span></div>
      </div>
      <div className="dots">
        {TESTIMONIALS.map((_, k) => (
          <button key={k} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Show review ${k + 1}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------- App ---------- */
export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState("flights");
  const [modal, setModal] = useState(null); // soon | login | wishlist | checkout
  const [wishlist, setWishlist] = useStoredState("yv_wishlist", []);
  const [bookmarks, setBookmarks] = useStoredState("yv_bookmarks", []);
  const [cart, setCart] = useStoredState("yv_cart", []);
  const [user, setUser] = useStoredState("yv_user", "");
  const [filter, setFilter] = useState("all");
  const [tripFilter, setTripFilter] = useState("all");
  const [mapFilter, setMapFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [authTab, setAuthTab] = useState("login");
  const [subscribed, setSubscribed] = useState(false);
  const [ai, setAi] = useState({ open: false, seed: null });
  const scrolled = useScrolled(40);

  const onDone = useCallback(() => setLoaded(true), []);
  const toggle = (setter) => (id) => setter((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));
  const toggleWish = toggle(setWishlist);
  const toggleBookmark = toggle(setBookmarks);
  const toggleCart = toggle(setCart);

  const openAI = (text) => setAi({ open: true, seed: { text, n: Date.now() } });
  const showOnMap = (id) => {
    setModal(null);
    setAi((a) => ({ ...a, open: false }));
    setMapFilter("all");
    setSelected(id);
    scrollToId("map");
  };
  const pickTrip = (id) => {
    setTripFilter(id);
    setFilter("all");
    scrollToId("packages");
  };
  const chooseTab = (tab) => {
    setActive(tab);
    scrollToId("search", "center");
  };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setModal(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shown = useMemo(
    () => PACKAGES.filter((p) => (filter === "all" || p.category === filter) && (tripFilter === "all" || p.trips.includes(tripFilter))),
    [filter, tripFilter]
  );
  const mapPlaces = useMemo(() => PLACES.filter((p) => mapFilter === "all" || p.kind === mapFilter), [mapFilter]);
  const selectedPlace = PLACES.find((p) => p.id === selected);

  const cartItems = useMemo(() => PACKAGES.filter((p) => cart.includes(p.id)), [cart]);
  const wishItems = useMemo(() => PACKAGES.filter((p) => wishlist.includes(p.id)), [wishlist]);
  const bookItems = useMemo(() => GEMS.filter((g) => bookmarks.includes(g.id)), [bookmarks]);
  const subtotal = cartItems.reduce((s, p) => s + p.price, 0);
  const taxes = subtotal * 0.05;

  return (
    <>
      {!loaded && <Preloader sources={PRELOAD} onDone={onDone} />}
      <Background />

      <Header
        scrolled={scrolled}
        active={active}
        setActive={setActive}
        wishCount={wishlist.length + bookmarks.length}
        cartCount={cart.length}
        user={user}
        onLogin={() => setModal("login")}
        onWishlist={() => setModal("wishlist")}
        onCheckout={() => setModal("checkout")}
      />

      <main>
        {/* HERO: headline on the left, search on the right */}
        <section className={`hero ${loaded ? "ready" : ""}`} id="top">
          <div className="hero-inner">
            <span className="line l1">IT’S TIME TO</span>
            <h1 className="line l2">TRAVEL BEYOND</h1>
            <p className="line l3">
              Crave new adventures, quiet mountain mornings and journeys that stay with you?
              Book flights, cabs and handpicked holidays with Yatra Ventures, and we will make
              sure it is an experience you never forget.
            </p>
            <div className="line l4 hero-cta">
              <a className="btn-pill outline" href="#offers">Our Offers</a>
              <a className="btn-pill ghost" href="#packages">Browse holidays <Icon name="arrow" size={16} /></a>
            </div>
          </div>

          <div className="line l5 hero-search">
            <SearchBox active={active} setActive={setActive} onSearch={() => setModal("soon")} />
          </div>

          <a className="scroll-hint" href="#stats" aria-label="Scroll down"><span /></a>
        </section>

        {/* STATS */}
        <section className="stats" id="stats">
          <div className="stats-grid">
            {STATS.map((s) => <Stat key={s.label} {...s} />)}
          </div>
        </section>

        {/* SERVICES */}
        <section className="section" id="services">
          <SectionHead eyebrow="What we do" title="Everything for your journey" text="One place to plan the whole trip, from the sky to the road to the stay." />
          <div className="grid3">
            {SERVICES.map((s, i) => (
              <Reveal key={s.title} delay={i * 120}>
                <div className="service">
                  <span className="service-icon"><Icon name={s.icon} size={26} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <button className="link-btn" onClick={() => chooseTab(s.tab)}>{s.cta} <Icon name="arrow" size={16} /></button>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TRIP TYPES */}
        <section className="section" id="trips">
          <SectionHead eyebrow="Plan by trip type" title="Who is travelling?" text="Pick your kind of trip and we will show the packages that suit it." />
          <div className="trip-cols">
            {TRIP_TYPES.map((t, i) => {
              const count = PACKAGES.filter((p) => p.trips.includes(t.id)).length;
              return (
                <Reveal key={t.id} delay={i * 90}>
                  <button className="trip-col" onClick={() => pickTrip(t.id)}>
                    <span className="service-icon"><Icon name={t.icon} size={24} /></span>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                    <span className="trip-count">{count} packages</span>
                    <span className="link-btn">Explore <Icon name="arrow" size={16} /></span>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* PACKAGES */}
        <section className="section" id="packages">
          <SectionHead eyebrow="Holiday packages" title="Popular escapes" text="Hand-picked itineraries with stays, sightseeing and transfers included." />
          <Reveal>
            <div className="chips">
              {[["all", "All"], ["mountains", "Mountains"], ["rivers", "Rivers & Backwaters"]].map(([id, label]) => (
                <button key={id} className={filter === id ? "on" : ""} onClick={() => setFilter(id)}>{label}</button>
              ))}
            </div>
            <div className="chips tight">
              <button className={tripFilter === "all" ? "on" : ""} onClick={() => setTripFilter("all")}>Any trip</button>
              {TRIP_TYPES.map((t) => (
                <button key={t.id} className={tripFilter === t.id ? "on" : ""} onClick={() => setTripFilter(t.id)}>{t.title.replace(" trips", "")}</button>
              ))}
            </div>
          </Reveal>
          {shown.length === 0 ? (
            <p className="no-results">No packages match these filters yet. Try another combination.</p>
          ) : (
            <div className="grid">
              {shown.map((p, i) => (
                <PackageCard
                  key={p.id}
                  pkg={p}
                  delay={(i % 4) * 90}
                  wished={wishlist.includes(p.id)}
                  inCart={cart.includes(p.id)}
                  onWish={toggleWish}
                  onCart={toggleCart}
                />
              ))}
            </div>
          )}
        </section>

        {/* HIDDEN GEMS */}
        <section className="section" id="gems">
          <SectionHead eyebrow="Hidden gems" title="Less crowded, more memorable" text="Quiet places most tourists skip. Bookmark the ones you like and plan a slower, calmer trip." />
          <div className="grid">
            {GEMS.map((g, i) => (
              <GemCard
                key={g.id}
                gem={g}
                delay={(i % 3) * 100}
                saved={bookmarks.includes(g.id)}
                onSave={toggleBookmark}
                onMap={showOnMap}
                onAsk={openAI}
              />
            ))}
          </div>
        </section>

        {/* INTERACTIVE MAP */}
        <section className="section" id="map">
          <SectionHead eyebrow="Interactive map" title="Explore destinations on the map" text="Click a pin to see the place. Popular escapes are gold, hidden gems are green." />
          <Reveal>
            <div className="map-layout">
              <div className="map-box">
                <TravelMap places={mapPlaces} selectedId={selected} onSelect={setSelected} />
              </div>
              <aside className="map-panel">
                <div className="chips tight left">
                  {[["all", "All"], ["popular", "Popular"], ["gem", "Hidden gems"]].map(([id, label]) => (
                    <button key={id} className={mapFilter === id ? "on" : ""} onClick={() => setMapFilter(id)}>{label}</button>
                  ))}
                </div>

                {selectedPlace ? (
                  <div className="sel-card">
                    <div className="sel-img" style={{ backgroundImage: `url(${selectedPlace.img})` }} />
                    <div className="sel-body">
                      <span className="region"><Icon name="pin" size={14} /> {selectedPlace.region}</span>
                      <h4>{selectedPlace.name}</h4>
                      <p>{selectedPlace.blurb}</p>
                      <p className="sel-extra">{selectedPlace.extra}</p>
                      <div className="sel-actions">
                        {selectedPlace.kind === "popular" ? (
                          <>
                            <button className="btn-pill sm outline-dark" onClick={() => toggleWish(selectedPlace.ref)}>
                              <Icon name="heart" size={14} fill={wishlist.includes(selectedPlace.ref) ? "currentColor" : "none"} />
                              {wishlist.includes(selectedPlace.ref) ? "Saved" : "Wishlist"}
                            </button>
                            <button className={"btn-pill sm " + (cart.includes(selectedPlace.ref) ? "added" : "solid")} onClick={() => toggleCart(selectedPlace.ref)}>
                              {cart.includes(selectedPlace.ref) ? "In cart" : "Add to cart"}
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn-pill sm outline-dark" onClick={() => toggleBookmark(selectedPlace.ref)}>
                              <Icon name="bookmark" size={14} fill={bookmarks.includes(selectedPlace.ref) ? "currentColor" : "none"} />
                              {bookmarks.includes(selectedPlace.ref) ? "Bookmarked" : "Bookmark"}
                            </button>
                            <button className="btn-pill sm solid" onClick={() => openAI(`Tell me about ${selectedPlace.name}`)}>Ask AI</button>
                          </>
                        )}
                      </div>
                      <a
                        className="link-btn gmaps"
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedPlace.lat},${selectedPlace.lng}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Google Maps <Icon name="arrow" size={14} />
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="map-empty">Select a pin on the map or a place from the list below.</p>
                )}

                <ul className="place-list">
                  {mapPlaces.map((p) => (
                    <li key={p.id}>
                      <button className={p.id === selected ? "on" : ""} onClick={() => setSelected(p.id)}>
                        <span className={"dot " + (p.kind === "gem" ? "gem" : "")} /> {p.name}
                        <small>{p.region}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
            </div>
          </Reveal>
        </section>

        {/* LIVE TRIP TRACKER */}
        <section className="section" id="tracker">
          <SectionHead eyebrow="Live trip tracker" title="Follow every trip, step by step" text="See where your cab or flight is, how far it has come and when it will arrive. This is a demo with sample trips." />
          <Reveal><TripTracker /></Reveal>
        </section>

        {/* OFFERS */}
        <section className="section" id="offers">
          <SectionHead eyebrow="Offers" title="Deals worth travelling for" text="Use these codes at checkout when bookings go live." />
          <div className="grid3">
            {OFFERS.map((o, i) => <OfferCard key={o.code} offer={o} delay={i * 120} />)}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="section" id="how">
          <SectionHead eyebrow="How it works" title="Plan in three simple steps" />
          <div className="grid3 steps">
            {STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 140}>
                <div className="step">
                  <span className="step-no">0{i + 1}</span>
                  <span className="service-icon"><Icon name={s.icon} size={24} /></span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* WHY */}
        <section className="section" id="why">
          <SectionHead eyebrow="Why Yatra Ventures" title="Travel with confidence" />
          <div className="grid3">
            {[
              ["shield", "Secure payments", "Multiple payment options with safe, encrypted checkout."],
              ["clock", "24/7 support", "Real people, available whenever your plans change."],
              ["tag", "Transparent pricing", "No hidden charges. What you see is what you pay."],
            ].map(([icon, t, d], i) => (
              <Reveal key={t} delay={i * 120}>
                <div className="service">
                  <span className="service-icon"><Icon name={icon} size={26} /></span>
                  <h3>{t}</h3>
                  <p>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="section" id="stories">
          <SectionHead eyebrow="Traveller stories" title="Loved by travellers" />
          <Reveal><Testimonials /></Reveal>
        </section>

        {/* NEWSLETTER */}
        <section className="section news-section">
          <Reveal>
            <div className="news">
              <div>
                <h2>Get travel deals in your inbox</h2>
                <p>Subscribe for seasonal offers and new destinations. No spam, ever.</p>
              </div>
              {subscribed ? (
                <p className="thanks"><Icon name="check" size={18} /> Thanks for subscribing.</p>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubscribed(true); }}>
                  <input type="email" placeholder="Your email address" required />
                  <button className="btn-pill solid">Subscribe</button>
                </form>
              )}
            </div>
          </Reveal>
        </section>
      </main>

      <GrassFooter>
        <div className="f-cols">
          <div className="f-about">
            <div className="brand light">
              <span className="brand-mark"><Icon name="mountain" size={18} /></span>
              <span className="brand-name">Yatra <em>Ventures</em></span>
            </div>
            <p>Your companion for every journey. Flights, cabs and holidays, planned simply.</p>
          </div>
          <div>
            <h4>Travel</h4>
            <a href="#top" onClick={() => setActive("flights")}>Flights</a>
            <a href="#top" onClick={() => setActive("cabs")}>Cabs</a>
            <a href="#packages">Holidays</a>
            <a href="#trips">Trip types</a>
          </div>
          <div>
            <h4>Explore</h4>
            <a href="#gems">Hidden gems</a>
            <a href="#map">Travel map</a>
            <a href="#tracker">Trip tracker</a>
            <a href="#offers">Offers</a>
          </div>
          <div>
            <h4>Contact</h4>
            <span className="f-line"><Icon name="mail" size={15} /> hello@yatraventures.example</span>
            <span className="f-line"><Icon name="phone" size={15} /> +91 00000 00000</span>
          </div>
        </div>
        <p className="copy">© {new Date().getFullYear()} Yatra Ventures. All rights reserved.</p>
      </GrassFooter>

      <AIAssistant
        open={ai.open}
        seed={ai.seed}
        onOpen={() => setAi((a) => ({ ...a, open: true }))}
        onClose={() => setAi((a) => ({ ...a, open: false }))}
        wishlist={wishlist}
        bookmarks={bookmarks}
        onWish={toggleWish}
        onBookmark={toggleBookmark}
        onMap={showOnMap}
      />

      {/* MODALS & DRAWERS */}
      {modal === "soon" && (
        <Modal onClose={() => setModal(null)}>
          <div className="soon">
            <span className="soon-icon"><Icon name="plane" size={34} /></span>
            <h2>Coming Soon</h2>
            <p>We are putting the final touches on bookings. Yatra Ventures will be taking off very soon.</p>
            <div className="shimmer" />
            <button className="btn-pill solid" onClick={() => setModal(null)}>Got it</button>
          </div>
        </Modal>
      )}

      {modal === "login" && (
        <Modal onClose={() => setModal(null)}>
          <h2>{authTab === "login" ? "Welcome back" : "Create your account"}</h2>
          <div className="auth-tabs">
            <button className={authTab === "login" ? "on" : ""} onClick={() => setAuthTab("login")}>Login</button>
            <button className={authTab === "signup" ? "on" : ""} onClick={() => setAuthTab("signup")}>Sign up</button>
          </div>
          <form
            className="stack"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              setUser(String(fd.get("name") || fd.get("email")).split("@")[0]);
              setModal(null);
            }}
          >
            {authTab === "signup" && <label>Full name<input name="name" required placeholder="Your name" /></label>}
            <label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>
            <label>Password<input type="password" required placeholder="Enter password" /></label>
            <button className="btn-pill solid">{authTab === "login" ? "Login" : "Create account"}</button>
          </form>
          {user && <button className="link-btn center" onClick={() => { setUser(""); setModal(null); }}>Logout</button>}
        </Modal>
      )}

      {modal === "wishlist" && (
        <Drawer title="Wishlist & bookmarks" icon="heart" onClose={() => setModal(null)}>
          {wishItems.length === 0 && bookItems.length === 0 ? (
            <p className="empty">Nothing saved yet. Tap the heart on a package or the bookmark on a hidden gem to save it here.</p>
          ) : (
            <>
              {wishItems.length > 0 && (
                <>
                  <h4 className="drawer-sub">Holiday packages</h4>
                  {wishItems.map((p) => (
                    <div className="line-item" key={p.id}>
                      <div className="thumb" style={{ backgroundImage: `url(${p.img})` }} />
                      <div className="li-info">
                        <strong>{p.name}</strong>
                        <span>{p.days} · {inr(p.price)}</span>
                        <div className="li-actions">
                          <button className="link-btn" onClick={() => toggleCart(p.id)}>{cart.includes(p.id) ? "In cart" : "Add to cart"}</button>
                          <button className="link-btn danger" onClick={() => toggleWish(p.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              {bookItems.length > 0 && (
                <>
                  <h4 className="drawer-sub">Bookmarked places</h4>
                  {bookItems.map((g) => (
                    <div className="line-item" key={g.id}>
                      <div className="thumb" style={{ backgroundImage: `url(${g.img})`, backgroundPosition: g.pos }} />
                      <div className="li-info">
                        <strong>{g.name}</strong>
                        <span>{g.region} · {CROWD_LABELS[g.crowd - 1]}</span>
                        <div className="li-actions">
                          <button className="link-btn" onClick={() => showOnMap(g.id)}>On map</button>
                          <button className="link-btn danger" onClick={() => toggleBookmark(g.id)}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </Drawer>
      )}

      {modal === "checkout" && (
        <Drawer title="Checkout" icon="cart" onClose={() => setModal(null)}>
          {cartItems.length === 0 ? (
            <p className="empty">Your cart is empty. Add a holiday package to continue.</p>
          ) : (
            <>
              {cartItems.map((p) => (
                <div className="line-item" key={p.id}>
                  <div className="thumb" style={{ backgroundImage: `url(${p.img})` }} />
                  <div className="li-info">
                    <strong>{p.name}</strong>
                    <span>{p.days} · {inr(p.price)}</span>
                    <button className="link-btn danger" onClick={() => toggleCart(p.id)}>Remove</button>
                  </div>
                </div>
              ))}
              <div className="summary">
                <div><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                <div><span>Taxes &amp; fees (5%)</span><span>{inr(taxes)}</span></div>
                <div className="total"><span>Total</span><strong>{inr(subtotal + taxes)}</strong></div>
              </div>
              <button className="btn-pill solid block" onClick={() => setModal("soon")}>Pay now</button>
            </>
          )}
        </Drawer>
      )}
    </>
  );
}