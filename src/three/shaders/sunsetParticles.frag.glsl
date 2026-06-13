uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;

void main() {
  vec2 uv = gl_PointCoord - vec2(0.5);
  float dist = length(uv);

  float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

  if (alpha < 0.01) discard;

  vec3 color = mix(uColorB, uColorA, dist * 2.0);

  gl_FragColor = vec4(color, alpha * uOpacity);
}
