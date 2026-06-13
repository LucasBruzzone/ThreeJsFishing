uniform float uTime;
uniform float uOpacity;

varying vec2 vUv;
varying float vElevation;

void main() {
  vec3 deep    = vec3(0.03, 0.08, 0.18);
  vec3 shallow = vec3(0.10, 0.22, 0.38);
  vec3 foam    = vec3(0.55, 0.65, 0.72);

  float t = clamp((vElevation + 0.1) / 0.2, 0.0, 1.0);
  vec3 color = mix(deep, shallow, t);

  // Foam highlights on wave peaks
  float foamLine = smoothstep(0.12, 0.18, vElevation);
  color = mix(color, foam, foamLine * 0.5);

  // Specular shimmer
  float shimmer = sin(vUv.x * 40.0 + uTime * 2.0) * sin(vUv.y * 30.0 + uTime * 1.5);
  color += vec3(0.04) * max(0.0, shimmer) * t;

  gl_FragColor = vec4(color, uOpacity * 0.88);
}
