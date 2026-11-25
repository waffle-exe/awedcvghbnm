import React from "react";
import { HERO, RIVER, GRASS } from "./images.js";
import { useScrollProgress } from "./hooks.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/*
  Fixed photographic background.
  Top of page: foggy mountain photo with drifting mist.
  Scrolling:   mountains fade out, river photo fades in.
*/
export function Background() {
  const p = useScrollProgress();
  const mountain = clamp(1 - p * 2.4);
  const river = clamp((p - 0.1) * 2.2);

  return (
    <div className="bg-wrap" aria-hidden="true">
      <div
        className="bg-layer"
        style={{ opacity: river, transform: `scale(${1.1 - river * 0.08})` }}
      >
        <div className="bg-photo river" style={{ backgroundImage: `url(${RIVER})` }} />
      </div>

      <div
        className="bg-layer"
        style={{ opacity: mountain, transform: `translateY(${-p * 90}px) scale(1.08)` }}
      >
        <div className="bg-photo mountain" style={{ backgroundImage: `url(${HERO})` }} />
      </div>

      <div className="mist m1" style={{ opacity: mountain }} />
      <div className="mist m2" style={{ opacity: mountain }} />
      <div className="mist m3" style={{ opacity: clamp(mountain * 0.8) }} />

      <div className="bg-shade" />
    </div>
  );
}

/* Footer with a real grass photo that fades in from the page above */
export function GrassFooter({ children }) {
  return (
    <footer className="footer">
      <div className="grass-photo" style={{ backgroundImage: `url(${GRASS})` }} />
      <div className="grass-tint" />
      <div className="footer-content">{children}</div>
    </footer>
  );
}
