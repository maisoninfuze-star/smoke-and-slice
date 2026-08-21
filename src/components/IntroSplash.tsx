/**
 * Opening logo animation.
 *
 * Architecture borrowed from the BMS build:
 *   · the overlay ships in the server-rendered HTML, so it owns the very first
 *     paint and there is no flash of the page behind it;
 *   · a pre-paint inline script (see layout.tsx) decides whether to show it at
 *     all, before the browser paints anything;
 *   · the timeline is pure CSS — JavaScript only unlocks scrolling afterwards.
 *
 * The sequence is built from the restaurant's own sign rather than being
 * generic: embers rise, the flame arc draws itself, MR drops in gold, SMOKE
 * wipes in, ET flares red, and SLICE is cut in by a pizza cutter that sweeps
 * the lockup — the shop's tagline is "L'amour à la première slice", so the
 * signature move is a slice.
 *
 * This is a server component. It renders no client JavaScript of its own.
 */
export function IntroSplash() {
  return (
    <div className="intro" id="intro" aria-hidden="true">
      <div className="intro-stage">
        {/* embers drifting up off the grill */}
        <div className="intro-embers">
          {Array.from({ length: 18 }, (_, i) => {
            // Deterministic so server and client markup match exactly.
            const seed = (i * 9301 + 49297) % 233280;
            const r = seed / 233280;
            const r2 = ((i * 4079 + 12345) % 2048) / 2048;
            return (
              <span
                key={i}
                style={{
                  left: `${3 + r * 94}%`,
                  animationDelay: `${(r2 * 2.2).toFixed(2)}s`,
                  animationDuration: `${(2.6 + r * 2.4).toFixed(2)}s`,
                  width: `${(2 + r2 * 3).toFixed(1)}px`,
                  height: `${(2 + r2 * 3).toFixed(1)}px`,
                }}
              />
            );
          })}
        </div>

        {/* flame arc — strokes draw themselves behind the wordmark */}
        <svg className="intro-flame" viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg" focusable="false">
          <defs>
            <linearGradient id="introEmber" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#f5b33c" />
              <stop offset="0.48" stopColor="#f2610c" />
              <stop offset="1" stopColor="#e01b24" />
            </linearGradient>
          </defs>
          <path
            className="intro-arc intro-arc-1"
            d="M60 170 C 120 60, 220 30, 300 30 C 380 30, 480 60, 540 170"
            fill="none"
            stroke="url(#introEmber)"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={1}
          />
          <path
            className="intro-arc intro-arc-2"
            d="M104 176 C 156 86, 232 58, 300 58 C 368 58, 444 86, 496 176"
            fill="none"
            stroke="#f5b33c"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
            pathLength={1}
          />
        </svg>

        <div className="intro-lockup">
          <span className="intro-mr">MR</span>

          <span className="intro-word">
            <span className="intro-smoke">SMOKE</span>
            <span className="intro-et">ET</span>
            {/* SLICE arrives in two halves parted by the cutter */}
            <span className="intro-slice">
              <span className="intro-slice-half intro-slice-top">SLICE</span>
              <span className="intro-slice-half intro-slice-bottom">SLICE</span>
            </span>
          </span>

          {/* the cutter itself */}
          <span className="intro-blade" />

          <span className="intro-tagline">L&apos;amour à la première slice</span>

          <span className="intro-halal">
            <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
              <path d="M12 2 3 6v6c0 5 3.8 9.4 9 10 5.2-.6 9-5 9-10V6l-9-4Zm-1 13.4-3.2-3.2 1.4-1.4L11 12.6l4.8-4.8 1.4 1.4L11 15.4Z" />
            </svg>
            HALAL
          </span>
        </div>
      </div>
    </div>
  );
}
