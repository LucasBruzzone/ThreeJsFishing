uniform float uOpacity;

varying vec3 vWorldPosition;

void main() {
  // Sphere radius 80, camera at y=2. Visible y range: approx -40 to +50.
  float t = clamp((vWorldPosition.y + 40.0) / 90.0, 0.0, 1.0);

  vec3 bottom = vec3(0.06, 0.02, 0.09);
  vec3 horizon = vec3(0.72, 0.22, 0.04);
  vec3 mid    = vec3(0.35, 0.06, 0.18);
  vec3 upper  = vec3(0.14, 0.02, 0.20);
  vec3 top    = vec3(0.03, 0.01, 0.08);

  vec3 color;
  if (t < 0.25) {
    color = mix(bottom, horizon, t / 0.25);
  } else if (t < 0.42) {
    color = mix(horizon, mid, (t - 0.25) / 0.17);
  } else if (t < 0.62) {
    color = mix(mid, upper, (t - 0.42) / 0.20);
  } else {
    color = mix(upper, top, (t - 0.62) / 0.38);
  }

  // Soft wide sun glow near horizon
  float sunGlow = exp(-pow((t - 0.28) * 3.5, 2.0));
  color += vec3(0.35, 0.12, 0.01) * sunGlow;

  gl_FragColor = vec4(color, uOpacity);
}
