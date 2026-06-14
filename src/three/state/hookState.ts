import * as THREE from 'three'

// Shared world-space position of the hook (the candle). FishingRod writes it
// every frame; SceneController and the Hook/HookLine components read it.
export const hookWorldPosition = new THREE.Vector3()
// World-space position of the rod tip — published so the line and any other
// scene-level visual can connect to it without needing a ref into the hand
// bone hierarchy.
export const rodTipWorldPosition = new THREE.Vector3()
