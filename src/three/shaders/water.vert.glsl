uniform float uTime;

varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;

  vec3 pos = position;

  float wave1 = sin(pos.x * 0.8 + uTime * 0.6) * 0.08;
  float wave2 = sin(pos.z * 1.2 + uTime * 0.4) * 0.06;
  float wave3 = sin((pos.x + pos.z) * 0.5 + uTime * 0.8) * 0.04;

  pos.y += wave1 + wave2 + wave3;
  vElevation = pos.y;

  vec4 worldPos = modelMatrix * vec4(pos, 1.0);
  vWorldPosition = worldPos.xyz;

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
