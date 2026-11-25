import React, { useEffect, useState } from "react";

/*
  Mountain preloader.
  - Mountains fill from the bottom as real images load.
  - When loading finishes the mountains sink away and the screen lifts up.
*/
export default function Preloader({ sources = [], onDone }) {
  const [progress, setProgress] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const MIN = 2400;  // minimum time on screen (ms)
    const MAX = 9000;  // never wait longer than this
    let loaded = 0;
    let raf = 0;
    let finished = false;
    const t0 = performance.now();

    sources.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => { loaded += 1; };
      img.src = src;
    });

    const finish = () => {
      if (finished) return;
      finished = true;
      setTimeout(() => setLeaving(true), 350);
      setTimeout(() => onDone && onDone(), 2300);
    };

    const tick = (now) => {
      const elapsed = now - t0;
      const real = sources.length ? loaded / sources.length : 1;
      const byTime = Math.min(1, elapsed / MIN);
      const target = elapsed > MAX ? 1 : Math.min(real, byTime);
      setProgress((p) => Math.max(p, target));
      if (target >= 1) finish();
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [sources, onDone]);

  const pct = Math.round(progress * 100);
  const riseY = 220 - 220 * progress;

  return (
    <div className={`preloader ${leaving ? "leaving" : ""}`} role="status" aria-label="Loading">
      <div className="pl-brand">Yatra <em>Ventures</em></div>

      <svg className="pl-svg" viewBox="0 0 400 220" aria-hidden="true">
        <defs>
          <clipPath id="plRise">
            <rect x="0" y={riseY} width="400" height="220" />
          </clipPath>
          <linearGradient id="plFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e3c58b" />
            <stop offset="1" stopColor="#6fae8c" />
          </linearGradient>
        </defs>

        {/* back range */}
        <g className="pl-mtn b">
          <path d="M0 200 L70 90 L120 140 L190 40 L260 140 L310 100 L400 200 Z" fill="url(#plFill)" opacity=".45" clipPath="url(#plRise)" />
          <path d="M0 200 L70 90 L120 140 L190 40 L260 140 L310 100 L400 200" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="1.5" />
        </g>
        {/* middle range */}
        <g className="pl-mtn m">
          <path d="M0 200 L90 120 L150 160 L230 80 L300 170 L360 130 L400 200 Z" fill="url(#plFill)" opacity=".7" clipPath="url(#plRise)" />
          <path d="M0 200 L90 120 L150 160 L230 80 L300 170 L360 130 L400 200" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="1.5" />
        </g>
        {/* front range */}
        <g className="pl-mtn f">
          <path d="M0 200 L60 150 L130 185 L200 130 L280 190 L340 160 L400 200 Z" fill="url(#plFill)" clipPath="url(#plRise)" />
          <path d="M0 200 L60 150 L130 185 L200 130 L280 190 L340 160 L400 200" fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.5" />
        </g>
        <line x1="0" y1="200" x2="400" y2="200" stroke="#fff" strokeOpacity=".4" />
      </svg>

      <div className="pl-meta">
        <span className="pl-pct">{pct}%</span>
        <span className="pl-text">Preparing your journey</span>
      </div>
      <div className="pl-bar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
