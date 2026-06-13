uniform vec3 uColor;
uniform float uIntensity;
uniform float uFalloff;

varying vec2 vUv;

void main() {
  float d = distance(vUv, vec2(0.5));
  float alpha = pow(max(0.0, 1.0 - d * 2.0), uFalloff);
  gl_FragColor = vec4(uColor * uIntensity, alpha);
}
