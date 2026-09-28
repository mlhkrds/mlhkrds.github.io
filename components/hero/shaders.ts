export const vertex = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Depth parallax: a few fixed-point steps find the source pixel for each screen pixel, so near
// features (face, hands) drift more than the shoulders. A faint cool rim catches the pointer's light.
export const fragment = /* glsl */ `
precision highp float;

uniform sampler2D uColor;
uniform sampler2D uDepth;
uniform vec2 uOffset;
uniform float uStrength;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  for (int i = 0; i < 4; i++) {
    float depth = texture2D(uDepth, uv).r;
    uv = vUv - uOffset * (depth - 0.5) * uStrength;
  }

  vec4 color = texture2D(uColor, uv);
  float edge = color.a - texture2D(uColor, uv + uOffset * 0.006).a;
  vec3 rim = mix(vec3(0.39, 0.53, 1.0), vec3(0.55, 0.36, 0.96), vUv.x);
  color.rgb += rim * clamp(edge, 0.0, 1.0) * 0.55 * length(uOffset);

  gl_FragColor = vec4(color.rgb * color.a, color.a);
}
`;
