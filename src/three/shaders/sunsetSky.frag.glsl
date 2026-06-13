uniform float uOpacity;

varying vec3 vWorldPosition;

void main() {
  float t = clamp((vWorldPosition.y + 6.0) / 12.0, 0.0, 1.0);

  vec3 bottom = vec3(0.08, 0.02, 0.10);
  vec3 mid    = vec3(0.45, 0.10, 0.18);
  vec3 top    = vec3(0.72, 0.25, 0.04);

  vec3 color = t < 0.5
    ? mix(bottom, mid, t * 2.0)
    : mix(mid, top, (t - 0.5) * 2.0);

  gl_FragColor = vec4(color, uOpacity);
}
