uniform float uTime;
varying vec2 vUv;
varying float vHeight;

void main() {
  // Radial distance from the flame axis — 0 at center, 1 at outer cone edge.
  float radial = abs(vUv.x - 0.5) * 2.0;

  // Vertical gradient: bright white core in the lower-middle, fading to
  // yellow / orange / transparent at the tip.
  vec3 coreColor = vec3(1.0, 0.97, 0.82);
  vec3 midColor  = vec3(1.0, 0.78, 0.30);
  vec3 outerColor = vec3(1.0, 0.45, 0.10);

  vec3 color = mix(coreColor, midColor, smoothstep(0.0, 0.45, vHeight));
  color = mix(color, outerColor, smoothstep(0.4, 0.95, vHeight));

  // Inner brightness peaks at the bottom-center; falls off at the tip and
  // at the radial edges.
  float intensity = (1.0 - radial) * (1.0 - pow(vHeight, 2.5));
  intensity = clamp(intensity, 0.0, 1.0);

  // Slight time flicker.
  float flicker = 0.92 + 0.08 * sin(uTime * 17.0);
  intensity *= flicker;

  // Alpha: opaque-ish in the core, transparent at edges and tip.
  float alpha = pow(intensity, 0.6) * 1.4;
  alpha = clamp(alpha, 0.0, 1.0);

  // Additive-friendly output (since we use AdditiveBlending in JS).
  gl_FragColor = vec4(color * intensity, alpha);
}
