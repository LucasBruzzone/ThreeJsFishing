uniform vec3 uColor;
uniform float uOpacity;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  float alpha = 1.0 - smoothstep(0.25, 0.5, dist);

  if (alpha < 0.01) discard;

  gl_FragColor = vec4(uColor, alpha * uOpacity);
}
