import React, { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TRACKS } from "./data.js";
import { TILE, ATTR } from "./TravelMap.jsx";
import Icon from "./Icons.jsx";
import { useInView } from "./hooks.js";

/* ---- route maths ---- */
const toRad = (d) => (d * Math.PI) / 180;
function dist(a, b) {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
function build(points) {
  const cum = [0];
  for (let i = 1; i < points.length; i++) cum.push(cum[i - 1] + dist(points[i - 1], points[i]));
  return { cum, total: cum[cum.length - 1] };
}
function locate(points, { cum, total }, p) {
  const target = p * total;
  let i = 1;
  while (i < cum.length - 1 && cum[i] < target) i++;
  const len = cum[i] - cum[i - 1] || 1;
  const f = Math.min(1, Math.max(0, (target - cum[i - 1]) / len));
  const a = points[i - 1];
  const b = points[i];
  return { pos: [a.lat + (b.lat - a.lat) * f, a.lng + (b.lng - a.lng) * f], seg: i };
}
const fmtMin = (m) => {
  const h = Math.floor(m / 60);
  const r = Math.round(m % 60);
  return h ? `${h}h ${r}m` : `${r}m`;
};
const STAGES = ["Booked", "Departed", "In transit", "Nearing", "Arrived"];

/*
  Live trip tracker (demo).
  It simulates a trip moving along its route. A real tracker needs a backend
  that feeds GPS / flight-status data into the same `p` (progress) value.
*/
export default function TripTracker() {
  const [tripId, setTripId] = useState(TRACKS[0].id);
  const [p, setP] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [wrapRef, seen] = useInView(0.3);
  const started = useRef(false);

  const trip = useMemo(() => TRACKS.find((t) => t.id === tripId), [tripId]);
  const route = useMemo(() => build(trip.points), [trip]);

  const elRef = useRef(null);
  const mapRef = useRef(null);
  const moverRef = useRef(null);
  const traveledRef = useRef(null);

  // start automatically the first time the section is seen
  useEffect(() => {
    if (seen && !started.current) {
      started.current = true;
      setPlaying(true);
    }
  }, [seen]);

  // advance the simulation
  useEffect(() => {
    if (!playing) return undefined;
    let last = performance.now();
    let raf;
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setP((x) => Math.min(1, x + (dt * speed) / 60)); // 1x = 60 seconds for the whole trip
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  useEffect(() => {
    if (p >= 1) setPlaying(false);
  }, [p]);

  // map setup
  useEffect(() => {
    const map = L.map(elRef.current, { scrollWheelZoom: false });
    L.tileLayer(TILE, { attribution: ATTR, subdomains: "abcd", maxZoom: 18 }).addTo(map);
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());
    mapRef.current = map;
    map.setView([22.5, 78], 5);
    const t = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t);
      map.remove();
    };
  }, []);

  // draw the route whenever the trip changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    const group = L.layerGroup().addTo(map);
    const latlngs = trip.points.map((x) => [x.lat, x.lng]);
    L.polyline(latlngs, { color: "#ffffff", weight: 3, opacity: 0.5, dashArray: "6 8" }).addTo(group);
    traveledRef.current = L.polyline([latlngs[0]], { color: "#e3c58b", weight: 5 }).addTo(group);
    trip.points.forEach((pt) => {
      L.circleMarker([pt.lat, pt.lng], { radius: 6, color: "#ffffff", weight: 2, fillColor: "#0b1f1a", fillOpacity: 1 })
        .bindTooltip(pt.name, { direction: "top" })
        .addTo(group);
    });
    moverRef.current = L.marker(latlngs[0], {
      icon: L.divIcon({ className: "mover", html: "<span></span>", iconSize: [26, 26], iconAnchor: [13, 13] }),
      zIndexOffset: 1000,
    }).addTo(group);
    map.fitBounds(latlngs, { padding: [50, 50] });
    return () => group.remove();
  }, [trip]);

  // move the marker
  useEffect(() => {
    if (!moverRef.current || !traveledRef.current) return;
    const { pos, seg } = locate(trip.points, route, p);
    moverRef.current.setLatLng(pos);
    traveledRef.current.setLatLngs(trip.points.slice(0, seg).map((x) => [x.lat, x.lng]).concat([pos]));
  }, [p, trip, route]);

  const choose = (id) => {
    setTripId(id);
    setP(0);
    setPlaying(true);
  };
  const restart = () => {
    setP(0);
    setPlaying(true);
  };

  const stage = p <= 0 ? 0 : p < 0.08 ? 1 : p < 0.85 ? 2 : p < 1 ? 3 : 4;
  const minsLeft = trip.minutes * (1 - p);
  const eta = new Date(Date.now() + minsLeft * 60000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const statusText = ["Booking confirmed", "Departed", "On the way", "Almost there", "Arrived"][stage];

  return (
    <div className="tracker-layout" ref={wrapRef}>
      <div className="map-box">
        <div ref={elRef} className="leaflet-host" />
      </div>

      <div className="track-panel">
        <div>
          <span className="demo-tag">Demo booking {trip.ref}</span>
          <h3 className="track-title">{trip.label} <small>({trip.mode})</small></h3>
        </div>

        <div className="track-tabs">
          {TRACKS.map((t) => (
            <button key={t.id} className={t.id === tripId ? "on" : ""} onClick={() => choose(t.id)}>{t.label}</button>
          ))}
        </div>

        <div className="progress"><i style={{ width: `${p * 100}%` }} /></div>

        <div className="track-stats">
          <div><small>Status</small><strong>{statusText}</strong></div>
          <div><small>Arrival around</small><strong>{p >= 1 ? "Arrived" : eta}</strong></div>
          <div><small>Distance covered</small><strong>{Math.round(trip.km * p)} km</strong></div>
          <div><small>Time left</small><strong>{p >= 1 ? "0m" : fmtMin(minsLeft)}</strong></div>
        </div>

        <div className="steps-row">
          {STAGES.map((s, i) => <span key={s} className={i <= stage ? "done" : ""}>{s}</span>)}
        </div>

        <ul className="checkpoints">
          {trip.points.map((pt, i) => {
            const done = i === 0 ? p > 0 : route.cum[i] / route.total <= p + 1e-6;
            return (
              <li key={pt.name} className={done ? "done" : ""}>
                <i>{done && <Icon name="check" size={10} />}</i> {pt.name}
              </li>
            );
          })}
        </ul>

        <div className="track-controls">
          <button className="btn-pill solid sm" onClick={() => (p >= 1 ? restart() : setPlaying(!playing))}>
            <Icon name={p >= 1 ? "refresh" : playing ? "pause" : "play"} size={14} />
            {p >= 1 ? "Replay" : playing ? "Pause" : "Play"}
          </button>
          <button className="btn-pill outline-dark sm" onClick={restart}><Icon name="refresh" size={14} /> Restart</button>
          <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} aria-label="Simulation speed">
            <option value={1}>1x speed</option>
            <option value={2}>2x speed</option>
            <option value={5}>5x speed</option>
            <option value={10}>10x speed</option>
          </select>
        </div>
        <p className="track-note">This is a sample trip. Live GPS and flight status will appear here once bookings go live.</p>
      </div>
    </div>
  );
}
