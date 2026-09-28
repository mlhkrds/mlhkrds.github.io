import { DISSOLVE } from './dissolve';

const float = (value: number) => value.toFixed(4);

// Shared by the photo and its stars. release() is the scroll progress at which each part of the photo
// breaks into stars, the chest first and the head last, along a grainy edge; reading the same map in both
// shaders makes every star appear exactly where its pixel goes.
const shatter = /* glsl */ `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

float release(vec2 uv) {
  float grain = noise(uv * 16.0) * 0.65 + noise(uv * 45.0) * 0.35;
  return clamp(0.015 + 0.15 * (1.0 - uv.y / 0.7) + (grain - 0.5) * 0.09, 0.01, 0.2);
}

// How much of the photo shows at rest: sharp down to the shoulders, then left to the stars.
float restKeep(float v) {
  return 1.0 - smoothstep(${float(DISSOLVE.start)}, ${float(DISSOLVE.end)}, v);
}
`;

export const photoVertex = /* glsl */ `
attribute vec2 uv;
uniform vec4 uRect;
uniform vec2 uViewport;
varying vec2 vUv;

void main() {
  vUv = vec2(uv.x, 1.0 - uv.y);
  vec2 clip = (uRect.xy + vUv * uRect.zw) / uViewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
}
`;

export const photoFragment = /* glsl */ `
precision highp float;
uniform sampler2D uImage;
uniform float uDock;
uniform float uTime;
uniform float uLive;
varying vec2 vUv;
${shatter}
void main() {
  vec4 color = texture2D(uImage, vec2(vUv.x, 1.0 - vUv.y));
  // Once the stars are live, the edge where the photo gives way to them drifts slowly.
  float drift = (noise(vUv * vec2(10.0, 16.0) + vec2(uTime * 0.05, uTime * 0.12)) - 0.5) * 0.1 * uLive;
  float r = release(vUv);
  float intact = 1.0 - smoothstep(r - 0.04, r, uDock);
  gl_FragColor = color * restKeep(vUv.y + drift) * intact;
}
`;

// The pointer blows through the stars like wind. The field is a small texture of displacements that the
// scene integrates as heavy springs: stars lean the way the pointer moved and settle back over a couple of
// seconds, swaying a little while they do.
const windChunk = /* glsl */ `
  vec2 wind = (texture2D(uWind, clamp(pos / uViewport, 0.0, 1.0)).rg * 255.0 - 128.0) / 85.0;
  float calm = (1.0 - smoothstep(0.0, 0.04, uDock)) * step(kind, 2.5);
  pos += (wind * (22.0 + fate.y * 16.0) + vec2(-wind.y, wind.x) * sin(t * 2.2 + phase * 9.0) * 4.0) * calm;
`;

/** Without vertex texture support the stars simply don't feel the wind. */
export const starVertex = (wind: boolean) => /* glsl */ `
attribute vec2 position;
attribute vec4 props;
attribute vec4 motion;
attribute vec4 fate;
attribute vec3 color;

uniform vec4 uRect;
uniform vec4 uShield;
uniform vec3 uSlot;
uniform vec2 uViewport;
uniform float uDock;
uniform float uDistance;
uniform float uTime;
uniform float uPixelRatio;
uniform float uMaxPoint;
${wind ? 'uniform sampler2D uWind;' : ''}

varying vec3 vColor;
varying float vAlpha;
varying float vSpike;
varying float vSoft;
${shatter}
void main() {
  float kind = motion.x;
  float t = uTime;
  float phase = props.z;
  float size = props.x;
  float alpha = props.y;
  float glint = 0.0;
  vec2 uv = position;
  float twinkle = 0.8 + 0.2 * sin(t * (0.9 + fract(phase * 3.7) * 1.4) + phase * 7.0);
  float flash = pow(max(0.0, sin(t * (0.35 + fract(phase * 5.3) * 0.5) + phase * 11.0)), 160.0);

  if (kind < 0.5) {
    // Body: climbs in from below on its own delay, the top of the body first, so the figure is completed
    // from the collar down.
    float k = clamp((t - 0.15 - props.w * 1.6) / (0.9 + fate.w * 0.6), 0.0, 1.0);
    uv += vec2((fate.y - 0.5) * 0.2, 0.08 + pow(fate.z, 1.5) * 0.3) * pow(1.0 - k, 3.0);
    alpha *= twinkle * smoothstep(0.0, 0.4, k);
    glint = flash;
  } else if (kind < 1.5) {
    // Photo: hidden until its pixel breaks away on scroll.
    float r = release(position);
    alpha *= twinkle * restKeep(uv.y) * smoothstep(r - 0.04, r, uDock);
  } else if (kind < 2.5) {
    // Skirt: born low in the body, it drifts slowly down and out to its side, then fades, over and over.
    float s = fract(t / motion.y + phase / 6.2832);
    uv += vec2(motion.z * (1.0 - (1.0 - s) * (1.0 - s)), motion.w * s) + vec2(sin(s * 6.2832 + phase) * 0.006, 0.0);
    alpha *= twinkle * smoothstep(0.0, 0.15, s) * (1.0 - smoothstep(0.6, 1.0, s)) * smoothstep(1.2, 3.0, t);
    alpha *= 1.0 - smoothstep(0.0, 0.15, uDock);
    glint = flash;
  } else {
    // Nebula: large soft colour behind the stars.
    uv += vec2(sin(t * 0.13 + phase), cos(t * 0.11 + phase * 1.7)) * 0.01;
    alpha *= smoothstep(0.5, 2.5, t) * (0.85 + 0.15 * sin(t * 0.3 + phase)) * (1.0 - smoothstep(0.0, 0.2, uDock));
  }

  vec2 pos = uRect.xy + uv * uRect.zw + vec2(sin(t * 0.6 + phase), cos(t * 0.5 + phase * 1.3)) * 1.2;

  if (kind < 1.5) {
    // On scroll the figure breaks apart. As its part of the photo lets go, each star bursts a little away
    // from the body and stays where it broke off while the page scrolls on under it; then they pour into
    // the nav avatar, nearest first. A few break off into the page instead.
    float r = release(position);
    vec2 away = (position - vec2(0.5, 0.45)) * uRect.zw;
    float spin = fate.y * 6.2832;
    vec2 burst = normalize(normalize(away + 0.001) + vec2(cos(spin), sin(spin)) * 0.6);
    pos.y += max(0.0, uDock - r) * uDistance * smoothstep(r, r + 0.1, uDock);
    pos += burst * (14.0 + fate.z * 46.0) * smoothstep(r, r + 0.12, uDock);

    float depart = 0.18 + 0.5 * clamp(0.8 * position.y + 0.2 * position.x, 0.0, 1.0) + 0.12 * fate.w;
    float f = clamp((uDock - depart) / 0.2, 0.0, 1.0);
    if (fate.x > 0.5) {
      float fe = 1.0 - (1.0 - f) * (1.0 - f);
      pos += (burst * (90.0 + fate.w * 230.0) + vec2(0.0, 40.0)) * fe;
      alpha *= mix(1.0, 0.55, fe) * (1.0 - smoothstep(0.9, 1.0, uDock));
    } else {
      // Accelerating into the avatar along a gently curving stream, brightening as they go.
      float fe = f * f;
      float angle = fate.z * 6.2832;
      vec2 target = uSlot.xy + vec2(cos(angle), sin(angle)) * uSlot.z * 0.55 * sqrt(fate.y);
      vec2 span = target - pos;
      vec2 bend = pos + span * 0.45 + vec2(-span.y, span.x) * (0.08 + (fate.z - 0.5) * 0.24);
      pos = mix(mix(pos, bend, fe), mix(bend, target, fe), fe);
      alpha *= (1.0 + 0.5 * f) * (1.0 - smoothstep(0.9, 1.0, f));
      size *= mix(1.0, 0.4, smoothstep(0.6, 1.0, f));
    }
  }

${wind ? windChunk : ''}

  // Stars dim behind the hero copy so the text and buttons stay easy to read.
  vec2 outside = max(abs(pos - uShield.xy) - uShield.zw, 0.0);
  alpha *= 1.0 - 0.8 * (1.0 - smoothstep(0.0, 48.0, length(outside)));

  vec2 clip = pos / uViewport * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vColor = color;
  vSoft = step(2.5, kind);
  vSpike = step(8.0, props.x);
  vAlpha = alpha * (1.0 + glint * 1.2);
  // Stars draw three times their size so the halo fits; nebula glows already carry their full size.
  float sprite = mix(3.0, 1.0, vSoft);
  gl_PointSize = clamp(size * sprite * uPixelRatio * (1.0 + glint * 0.35), 1.0, uMaxPoint);
  // Hidden stars (the photo's, before it breaks; faded skirt) cost no fill at all.
  if (vAlpha < 0.002) gl_PointSize = 0.0;
}
`;

// A white-hot core inside a coloured halo, with a diffraction cross on the rare brightest stars.
// Nebula glows are just a soft disc of colour.
export const starFragment = /* glsl */ `
precision highp float;
varying vec3 vColor;
varying float vAlpha;
varying float vSpike;
varying float vSoft;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(p, p);
  if (r2 > 1.0) discard;
  if (vSoft > 0.5) {
    float a = exp(-r2 * 2.2) * (1.0 - r2) * vAlpha;
    gl_FragColor = vec4(vColor * a, a);
    return;
  }
  float core = exp(-r2 * 40.0);
  float halo = exp(-r2 * 6.0) * 0.3;
  float spikes = vSpike * (exp(-abs(p.x) * 26.0) + exp(-abs(p.y) * 26.0)) * (1.0 - sqrt(r2)) * 0.9;
  vec3 tint = mix(vColor, vec3(1.0), min(1.0, core + spikes * 0.4));
  float a = (core + halo + spikes) * vAlpha;
  gl_FragColor = vec4(tint * a, a);
}
`;
