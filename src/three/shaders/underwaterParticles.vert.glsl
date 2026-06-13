uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomOffset;

void main() {
  vec3 pos = position;

  float drift = mod(pos.y + uTime * 0.02 + aRandomOffset.y, 14.0) - 7.0;
  pos.y = drift;

  pos.x += sin(uTime * 0.08 + aRandomOffset.x * 6.28) * 0.5;
  pos.z += cos(uTime * 0.06 + aRandomOffset.z * 6.28) * 0.4;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = uSize * aScale * (80.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
