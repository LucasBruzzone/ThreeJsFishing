uniform float uTime;
uniform float uScroll;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomOffset;

void main() {
  vec3 pos = position;

  float drift = mod(pos.y + uTime * 0.08 + aRandomOffset.y, 8.0) - 4.0;
  pos.y = drift;

  pos.x += sin(uTime * 0.3 + aRandomOffset.x * 6.28) * 0.15;
  pos.z += cos(uTime * 0.2 + aRandomOffset.z * 6.28) * 0.1;

  pos.y -= uScroll * 1.2;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aScale * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
