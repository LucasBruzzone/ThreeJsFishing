import { useMemo } from 'react'
import * as THREE from 'three'

interface Props {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
}

const TRUNK_BROWN = '#5c3a1e'
const FROND_DARK = '#1a5c1a'
const FROND_LIGHT = '#2e8b2e'
const FROND_COUNT = 10
const TRUNK_HEIGHT = 4.5
const TRUNK_SEGMENTS = 20

function buildTrunkGeometry(): THREE.BufferGeometry {
  const radii = 8
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.1, TRUNK_HEIGHT * 0.25, 0),
    new THREE.Vector3(0.25, TRUNK_HEIGHT * 0.5, 0.05),
    new THREE.Vector3(0.15, TRUNK_HEIGHT * 0.75, -0.05),
    new THREE.Vector3(0, TRUNK_HEIGHT, 0),
  ])

  const points = curve.getPoints(TRUNK_SEGMENTS)
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  points.forEach((point, segmentIndex) => {
    const t = segmentIndex / TRUNK_SEGMENTS
    const radius = THREE.MathUtils.lerp(0.12, 0.07, t)
    const tangent = curve.getTangent(t).normalize()
    const normal = new THREE.Vector3(0, 1, 0)
    const binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize()
    const actualNormal = new THREE.Vector3().crossVectors(binormal, tangent).normalize()

    for (let radialIndex = 0; radialIndex <= radii; radialIndex++) {
      const theta = (radialIndex / radii) * Math.PI * 2
      const cos = Math.cos(theta)
      const sin = Math.sin(theta)
      const radialVec = new THREE.Vector3(
        actualNormal.x * cos + binormal.x * sin,
        actualNormal.y * cos + binormal.y * sin,
        actualNormal.z * cos + binormal.z * sin,
      )
      positions.push(
        point.x + radialVec.x * radius,
        point.y + radialVec.y * radius,
        point.z + radialVec.z * radius,
      )
      normals.push(radialVec.x, radialVec.y, radialVec.z)
      uvs.push(radialIndex / radii, t)
    }
  })

  for (let segmentIndex = 0; segmentIndex < TRUNK_SEGMENTS; segmentIndex++) {
    for (let radialIndex = 0; radialIndex < radii; radialIndex++) {
      const a = segmentIndex * (radii + 1) + radialIndex
      const b = a + radii + 1
      indices.push(a, b, a + 1, b, b + 1, a + 1)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  return geo
}

function buildFrondGeometry(length: number, width: number, droop: number): THREE.BufferGeometry {
  const leafletCount = 16
  const positions: number[] = []
  const normals: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let leafletIndex = 0; leafletIndex < leafletCount; leafletIndex++) {
    const t = leafletIndex / (leafletCount - 1)
    const midX = t * length
    const midY = -droop * t * t
    const leafletWidth = width * Math.sin(t * Math.PI) * 0.5
    const tangentX = 1
    const tangentY = -droop * 2 * t
    const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY)
    const perpX = -tangentY / tangentLen
    const perpY = tangentX / tangentLen

    const base = positions.length / 3
    positions.push(
      midX - perpX * leafletWidth, midY - perpY * leafletWidth, 0,
      midX + perpX * leafletWidth, midY + perpY * leafletWidth, 0,
    )
    normals.push(0, 0, 1, 0, 0, 1)
    uvs.push(t, 0, t, 1)

    if (leafletIndex < leafletCount - 1) {
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geo.setIndex(indices)
  geo.computeVertexNormals()
  return geo
}

const PalmTree = ({ position, rotation, scale = 1 }: Props) => {
  const trunkGeo = useMemo(() => buildTrunkGeometry(), [])

  const fronds = useMemo(() => {
    return Array.from({ length: FROND_COUNT }, (_, frondIndex) => {
      const angleStep = (Math.PI * 2) / FROND_COUNT
      const angle = frondIndex * angleStep + (frondIndex % 2) * 0.15
      const length = 2.2 + Math.sin(frondIndex * 1.3) * 0.4
      const droop = 0.8 + Math.sin(frondIndex * 0.7) * 0.2
      const geo = buildFrondGeometry(length, 0.18, droop)
      return { angle, droop, geo }
    })
  }, [])

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={trunkGeo}>
        <meshStandardMaterial color={TRUNK_BROWN} roughness={0.95} metalness={0} />
      </mesh>

      {fronds.map(({ angle, droop, geo }, frondIndex) => (
        <group
          key={frondIndex}
          position={[0, TRUNK_HEIGHT, 0]}
          rotation={[droop * 0.4, angle, -droop * 0.5]}
        >
          <mesh geometry={geo}>
            <meshStandardMaterial
              color={frondIndex % 2 === 0 ? FROND_DARK : FROND_LIGHT}
              roughness={0.7}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default PalmTree
