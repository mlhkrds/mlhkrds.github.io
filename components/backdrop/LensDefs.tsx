/** SVG displacement filters for the Chromium-only glass lens; each map is drawn at runtime by useLens. */
export function LensDefs() {
  return (
    <svg className="svg-defs" aria-hidden="true" focusable="false">
      {['lens-nav', 'lens-palette'].map((id) => (
        <filter key={id} id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feImage id={`${id}-map`} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
          <feDisplacementMap in="SourceGraphic" in2="map" scale="36" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      ))}
    </svg>
  );
}
