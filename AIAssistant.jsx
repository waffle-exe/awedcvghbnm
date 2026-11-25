import React, { useEffect, useRef, useState } from "react";
import { PACKAGES, GEMS, TRIP_TYPES, OFFERS, CROWD_LABELS } from "./data.js";
import Icon from "./Icons.jsx";

const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

const SUGGEST = [
  "Quiet places for a solo trip",
  "Couple trip under ₹25,000",
  "Family trip in the mountains",
  "Bachelorette trip ideas",
];

const TYPE_PATTERNS = {
  solo: /solo|alone|by myself/,
  couple: /couple|honeymoon|romantic|partner|anniversary/,
  friends: /friend|group|buddies|gang/,
  bachelorette: /bachelorette|bride|hen party|bridesmaid/,
  family: /family|kids|children|parents|elders/,
};

function parseBudget(t) {
  const m = t.match(/(?:under|below|within|budget|upto|up to|less than|₹|rs\.?|inr)\s*(\d[\d,]*(?:\.\d+)?)\s*(k|thousand|lakh|lac|l)?\b/);
  if (!m) return null;
  let n = parseFloat(m[1].replace(/,/g, ""));
  const unit = m[2];
  if (unit === "k" || unit === "thousand") n *= 1000;
  else if (unit) n *= 100000;
  else if (n < 1000) n *= 1000; // "under 25" is read as 25,000
  return n;
}

/* Simple rule-based planner. It only uses the packages and hidden gems on this site. */
function reply(q) {
  const t = q.toLowerCase();

  if (/^(hi|hello|hey|namaste)\b/.test(t)) {
    return { text: "Hi! Tell me who is travelling, your budget, or whether you want somewhere quiet, and I will suggest places." };
  }
  if (/offer|coupon|code|discount/.test(t)) {
    return { text: `Current codes: ${OFFERS.map((o) => `${o.code} (${o.title})`).join("; ")}. You can copy them from the Offers section.` };
  }
  if (/track|where is my/.test(t)) {
    return { text: "Scroll to the Live trip tracker on this page. It shows a sample trip moving along its route on the map." };
  }
  if (/\b(flight|flights|cab|cabs|taxi)\b/.test(t) && !/trip/.test(t)) {
    return { text: "Flight and cab bookings are coming soon. For now you can save holiday packages to your wishlist and add them to your cart." };
  }

  // a place was named
  const all = [
    ...PACKAGES.map((item) => ({ kind: "pkg", item })),
    ...GEMS.map((item) => ({ kind: "gem", item })),
  ];
  const named = all.find((x) => t.includes(x.item.name.toLowerCase().split(" ")[0]));
  if (named) {
    const it = named.item;
    const text =
      named.kind === "gem"
        ? `${it.name} (${it.region}): ${it.blurb} Crowd level: ${CROWD_LABELS[it.crowd - 1].toLowerCase()}. Best time: ${it.season}. Plan ${it.days}.`
        : `${it.name} (${it.region}): ${it.blurb} It is a ${it.days} package from ${inr(it.price)}.`;
    return { text, picks: [named] };
  }

  const type = TRIP_TYPES.find((x) => TYPE_PATTERNS[x.id].test(t));
  const quiet = /quiet|offbeat|off-beat|hidden|gem|crowd|peace|calm|secluded|untouched/.test(t);
  const budget = parseBudget(t);
  const hills = /mountain|hill|snow|trek|valley|cold/.test(t);
  const water = /river|backwater|water|boat|lake/.test(t);
  const fits = (it) => !type || it.trips.includes(type.id);
  const who = type ? ` for ${type.title.toLowerCase()}` : "";

  if (!type && !quiet && !budget && !hills && !water) {
    return { text: "I can suggest trips by trip type (solo, couple, friends, bachelorette, family), budget, mountains or rivers, and how crowded a place is. Try one of the ideas below." };
  }

  if (quiet) {
    let list = GEMS.filter(fits);
    if (!list.length) list = GEMS;
    list = [...list].sort((a, b) => a.crowd - b.crowd).slice(0, 3);
    return { text: `Here are quieter places${who} that most tourists skip:`, picks: list.map((item) => ({ kind: "gem", item })) };
  }

  let list = PACKAGES.filter(fits);
  if (budget) list = list.filter((p) => p.price <= budget);
  if (hills) list = list.filter((p) => p.category === "mountains");
  if (water) list = list.filter((p) => p.category === "rivers");

  if (!list.length) {
    const fallback = [...PACKAGES.filter(fits)].sort((a, b) => a.price - b.price).slice(0, 3);
    return { text: `I could not find an exact match${who}, so here are the closest options:`, picks: fallback.map((item) => ({ kind: "pkg", item })) };
  }
  list = [...list].sort((a, b) => a.price - b.price).slice(0, 3);
  const extra = budget ? ` within ${inr(budget)}` : "";
  return { text: `Here are some holiday packages${who}${extra}:`, picks: list.map((item) => ({ kind: "pkg", item })) };
}

export default function AIAssistant({ open, seed, onOpen, onClose, wishlist, bookmarks, onWish, onBookmark, onMap }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I am the Yatra assistant. Tell me who is travelling, your budget, or if you want somewhere quiet, and I will suggest places." },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);
  const lastSeed = useRef(0);
  const timer = useRef(null);

  const send = (text) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: "me", text: q }]);
    setTyping(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", ...reply(q) }]);
      setTyping(false);
    }, 650);
  };

  useEffect(() => {
    if (seed && seed.n !== lastSeed.current) {
      lastSeed.current = seed.n;
      send(seed.text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  if (!open) {
    return (
      <button className="ai-fab" onClick={onOpen} aria-label="Open Yatra assistant">
        <Icon name="message" size={18} /> Ask Yatra AI
      </button>
    );
  }

  return (
    <div className="ai-panel" role="dialog" aria-label="Yatra assistant">
      <div className="ai-head">
        <span className="brand-mark"><Icon name="sparkle" size={18} /></span>
        <div><strong>Yatra AI</strong><small>Trip planning assistant</small></div>
        <button className="x" onClick={onClose} aria-label="Close assistant"><Icon name="close" size={20} /></button>
      </div>

      <div className="ai-body" ref={bodyRef}>
        {messages.map((m, i) => (
          <React.Fragment key={i}>
            <div className={`msg ${m.from}`}>{m.text}</div>
            {m.picks && (
              <div className="ai-picks">
                {m.picks.map(({ kind, item }) => {
                  const saved = kind === "pkg" ? wishlist.includes(item.id) : bookmarks.includes(item.id);
                  const mapId = kind === "pkg" ? (item.lat != null ? `p${item.id}` : null) : item.id;
                  return (
                    <div className="ai-pick" key={`${kind}-${item.id}`}>
                      <div className="thumb" style={{ backgroundImage: `url(${item.img})` }} />
                      <div>
                        <strong>{item.name}</strong>
                        <span>
                          {kind === "pkg"
                            ? `${item.days} · from ${inr(item.price)}`
                            : `${CROWD_LABELS[item.crowd - 1]} · Best ${item.season}`}
                        </span>
                        <div className="row-actions">
                          <button className="link-btn" onClick={() => (kind === "pkg" ? onWish(item.id) : onBookmark(item.id))}>
                            {saved ? "Saved" : kind === "pkg" ? "Save" : "Bookmark"}
                          </button>
                          {mapId && <button className="link-btn" onClick={() => onMap(mapId)}>On map</button>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        ))}
        {typing && <div className="typing"><i /><i /><i /></div>}
      </div>

      {messages.length < 3 && (
        <div className="ai-suggest">
          {SUGGEST.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
        </div>
      )}

      <form
        className="ai-form"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput("");
        }}
      >
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about trips, budgets, quiet places" aria-label="Message" />
        <button aria-label="Send"><Icon name="arrow" size={18} /></button>
      </form>
      <p className="ai-note">Suggestions come from the packages and hidden gems on this site.</p>
    </div>
  );
}
