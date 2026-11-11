import * as ingredients from "./ingredients.js";
import * as stations from "./stations.js";
import * as products from "./products.js";

export const art = { ...ingredients, ...stations, ...products };

// Filtros e gradientes usados por vários desenhos. Vão uma vez só na página.
export const SHARED_DEFS = `
<filter id="grain" x="-10%" y="-10%" width="120%" height="120%">
  <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="n"/>
  <feColorMatrix in="n" type="saturate" values="0" result="g"/>
  <feComponentTransfer in="g" result="soft">
    <feFuncR type="linear" slope=".35" intercept=".72"/>
    <feFuncG type="linear" slope=".35" intercept=".72"/>
    <feFuncB type="linear" slope=".35" intercept=".72"/>
  </feComponentTransfer>
  <feBlend in="SourceGraphic" in2="soft" mode="multiply" result="b"/>
  <feComposite in="b" in2="SourceGraphic" operator="in"/>
</filter>
<filter id="blur1" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation=".9"/></filter>
<filter id="soft"x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
<linearGradient id="plateRim" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e9ecef"/><stop offset="1" stop-color="#bfc5cc"/>
</linearGradient>
<radialGradient id="plateWell" cx=".5" cy=".4" r=".6">
  <stop offset="0" stop-color="#f7f8f9"/><stop offset="1" stop-color="#d6dbe0"/>
</radialGradient>
<radialGradient id="shrimpBody" gradientUnits="userSpaceOnUse" cx="100" cy="92" r="48">
  <stop offset=".42" stop-color="#ffe2cf"/><stop offset=".62" stop-color="#ffa477"/>
  <stop offset=".85" stop-color="#f06a44"/><stop offset="1" stop-color="#c8432b"/>
</radialGradient>
<linearGradient id="tailFin" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#ffb08a"/><stop offset=".7" stop-color="#e5533a"/><stop offset="1" stop-color="#a8301f"/>
</linearGradient>
<radialGradient id="cap" cx=".42" cy=".3" r=".75">
  <stop offset="0" stop-color="#c4864f"/><stop offset=".55" stop-color="#8a4c25"/><stop offset="1" stop-color="#4a2510"/>
</radialGradient>
<linearGradient id="stem" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#c9b089"/><stop offset=".45" stop-color="#f6eddc"/><stop offset="1" stop-color="#bfa47c"/>
</linearGradient>
<radialGradient id="gills" cx=".5" cy=".5" r=".55">
  <stop offset="0" stop-color="#e9dcc0"/><stop offset="1" stop-color="#f8f1e2"/>
</radialGradient>
<linearGradient id="clove" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#d9c8d3"/><stop offset=".5" stop-color="#fdfaf4"/><stop offset="1" stop-color="#d4c2cf"/>
</linearGradient>
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="#d9ccb5"/><stop offset=".5" stop-color="#f6efe2"/><stop offset="1" stop-color="#cfbfa4"/>
</linearGradient>
<radialGradient id="bulbShade" cx=".45" cy=".4" r=".6">
  <stop offset=".55" stop-color="#5a2d55" stop-opacity="0"/><stop offset="1" stop-color="#5a2d55" stop-opacity=".22"/>
</radialGradient>`;
