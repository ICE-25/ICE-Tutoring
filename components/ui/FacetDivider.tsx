/**
 * The signature faceted low-poly seam carried over from the original site,
 * now drawn as a glowing HUD trace with a soft scan pulse travelling along it.
 */
export function FacetDivider() {
  return (
    <div className="relative h-10 w-full overflow-hidden" aria-hidden>
      <svg
        viewBox="0 0 1200 26"
        preserveAspectRatio="none"
        className="h-full w-full"
      >
        <defs>
          <linearGradient id="facet-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1560D6" />
            <stop offset="0.5" stopColor="#6FE3FF" />
            <stop offset="1" stopColor="#34C7F4" />
          </linearGradient>
          <filter id="facet-glow" x="-20%" y="-200%" width="140%" height="500%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <polyline
          points="0,26 60,4 130,20 210,2 300,18 380,6 470,22 560,4 650,18 740,2 830,20 920,6 1010,22 1100,4 1200,16"
          stroke="url(#facet-grad)"
          strokeWidth="2"
          fill="none"
          filter="url(#facet-glow)"
        />
      </svg>
    </div>
  );
}
