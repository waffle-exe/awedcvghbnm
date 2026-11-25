import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export const TILE = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

/* Interactive map of popular destinations (gold) and hidden gems (green) */
export default function TravelMap({ places, selectedId, onSelect }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const map = L.map(elRef.current, { scrollWheelZoom: false, minZoom: 3 }).setView([22.5, 80], 5);
    L.tileLayer(TILE, { attribution: ATTR, subdomains: "abcd", maxZoom: 18 }).addTo(map);
    groupRef.current = L.layerGroup().addTo(map);
    // scroll-zoom only after the visitor clicks the map, so page scrolling is never blocked
    map.on("click", () => map.scrollWheelZoom.enable());
    map.on("mouseout", () => map.scrollWheelZoom.disable());
    mapRef.current = map;
    const t = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t);
      map.remove();
    };
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.clearLayers();
    places.forEach((p) => {
      const icon = L.divIcon({
        className: `pin ${p.kind}${p.id === selectedId ? " sel" : ""}`,
        html: "<span></span>",
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([p.lat, p.lng], { icon, title: p.name, riseOnHover: true })
        .on("click", () => onSelect(p.id))
        .bindTooltip(p.name, { direction: "top", offset: [0, -10] })
        .addTo(group);
    });
  }, [places, selectedId, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    const p = places.find((x) => x.id === selectedId);
    if (map && p) map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 7), { duration: 1.2 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={elRef} className="leaflet-host" />;
}
