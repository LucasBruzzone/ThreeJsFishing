uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomOffset;

void main() {
  vec3 pos = position;

  float drift = mod(pos.y + uTime * 0.04 + aRandomOffset.y, 10.0) - 5.0;
  pos.y = drift;

  pos.x += sin(uTime * 0.15 + aRandomOffset.x * 6.28) * 0.3;
  pos.z += cos(uTime * 0.1 + aRandomOffset.z * 6.28) * 0.2;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aScale * (80.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
