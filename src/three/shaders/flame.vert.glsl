uniform float uTime;
varying vec2 vUv;
varying float vHeight;

// Cheap hash-based 3D noise — enough wobble for a flame without the cost of
// a full Perlin / simplex implementation.
float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i + vec3(0.,0.,0.)), hash(i + vec3(1.,0.,0.)), f.x),
        mix(hash(i + vec3(0.,1.,0.)), hash(i + vec3(1.,1.,0.)), f.x), f.y),
    mix(mix(hash(i + vec3(0.,0.,1.)), hash(i + vec3(1.,0.,1.)), f.x),
        mix(hash(i + vec3(0.,1.,1.)), hash(i + vec3(1.,1.,1.)), f.x), f.y),
    f.z);
}

void main() {
  vUv = uv;
  vHeight = uv.y;

  // Lateral wobble grows with height — the tip flickers, the base stays put.
  vec3 displaced = position;
  float wobble = noise(position * 6.0 + vec3(0.0, uTime * 3.0, 0.0));
  float amp = pow(uv.y, 1.5) * 0.012;
  displaced.x += (wobble - 0.5) * amp * 2.0;
  displaced.z += (noise(position * 5.0 + vec3(uTime * 2.7, 0.0, 0.0)) - 0.5) * amp * 2.0;

  // Slight overall sway
  displaced.x += sin(uTime * 4.0) * uv.y * 0.004;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}
