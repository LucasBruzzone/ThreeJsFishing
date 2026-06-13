uniform float uTime;
uniform float uOpacity;
uniform vec3 uSunPosition;

varying vec2 vUv;
varying float vElevation;
varying vec3 vWorldPosition;

void main() {
  vec3 deep    = vec3(0.04, 0.08, 0.20);
  vec3 shallow = vec3(0.16, 0.28, 0.48);
  vec3 foam    = vec3(0.65, 0.72, 0.78);
  vec3 sunTint = vec3(1.0, 0.55, 0.25);

  float t = clamp((vElevation + 0.1) / 0.2, 0.0, 1.0);
  vec3 color = mix(deep, shallow, t);

  // Blend the water toward the dark sunset sky at the horizon so the bright
  // shallow color does not bleed into the skyline as a hard cyan band.
  vec3 horizonTint = vec3(0.08, 0.04, 0.10);
  float horizonStart = uSunPosition.z + 15.0;
  float horizonEnd   = uSunPosition.z - 2.0;
  float horizonBlend = smoothstep(horizonStart, horizonEnd, vWorldPosition.z);
  color = mix(color, horizonTint, horizonBlend);

  // Sun reflection column from the sun toward the camera.
  float distFromCenter = abs(vWorldPosition.x - uSunPosition.x);
  float distFromHorizon = clamp((vWorldPosition.z - uSunPosition.z) / 35.0, 0.0, 1.0);
  // Wider near camera, narrow at horizon
  float columnWidth = mix(0.6, 6.5, distFromHorizon);
  float column = exp(-pow(distFromCenter / columnWidth, 2.0));
  // Wave breakup so it looks like glints, not a solid bar
  float waveBreak = 0.5 + 0.5 * sin(vWorldPosition.z * 2.5 + uTime * 1.8)
                       * sin(vWorldPosition.x * 1.5 - uTime * 1.2);
  float sunReflection = column * waveBreak * (1.0 - distFromHorizon * 0.4);
  color += sunTint * sunReflection * 0.7;

  // Foam highlights on wave peaks — fade out at distance so the horizon line is clean.
  float foamLine = smoothstep(0.12, 0.18, vElevation);
  float foamDistanceFade = 1.0 - smoothstep(horizonStart, horizonEnd, vWorldPosition.z);
  color = mix(color, foam, foamLine * 0.4 * foamDistanceFade);

  // Specular shimmer
  float shimmer = sin(vUv.x * 40.0 + uTime * 2.0) * sin(vUv.y * 30.0 + uTime * 1.5);
  color += vec3(0.04) * max(0.0, shimmer) * t;

  gl_FragColor = vec4(color, uOpacity * 0.9);
}
