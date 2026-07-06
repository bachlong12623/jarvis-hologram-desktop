import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function starPoints(sides: number, outerR: number, innerR?: number) {
  const pts: number[] = []
  const step = Math.PI / sides
  const inner = innerR ?? outerR * 0.45

  for (let i = 0; i < sides * 2; i++) {
    const r = i % 2 === 0 ? outerR : inner
    const a = i * step - Math.PI / 2
    pts.push(Math.cos(a) * r, Math.sin(a) * r, 0)
  }
  pts.push(pts[0], pts[1], pts[2])
  return pts
}

function pentagramLines(radius: number) {
  const verts: number[] = []
  const angles: number[] = []
  for (let i = 0; i < 5; i++) {
    angles.push((i * 2 * Math.PI) / 5 - Math.PI / 2)
  }
  const order = [0, 2, 4, 1, 3, 0]
  for (let i = 0; i < order.length - 1; i++) {
    const a = angles[order[i]]
    const b = angles[order[i + 1]]
    verts.push(
      Math.cos(a) * radius, Math.sin(a) * radius, 0,
      Math.cos(b) * radius, Math.sin(b) * radius, 0,
    )
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  return geo
}

function runeRing(radius: number, count: number, len: number) {
  const verts: number[] = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    const c = Math.cos(a)
    const s = Math.sin(a)
    verts.push(c * radius, s * radius, 0, c * (radius + len), s * (radius + len), 0)
    const ra = a + 0.04
    verts.push(
      Math.cos(ra) * (radius + len * 0.6),
      Math.sin(ra) * (radius + len * 0.6),
      0,
      Math.cos(ra + 0.08) * (radius + len * 0.3),
      Math.sin(ra + 0.08) * (radius + len * 0.3),
      0,
    )
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3))
  return geo
}

function hexagonLoop(radius: number) {
  const pts: number[] = []
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * Math.PI * 2 - Math.PI / 6
    pts.push(Math.cos(a) * radius, Math.sin(a) * radius, 0)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
  return geo
}

export function MagicCircle() {
  const outerRef = useRef<THREE.Group>(null)
  const midRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Group>(null)
  const starRef = useRef<THREE.LineSegments>(null)

  const pentagramGeo = useMemo(() => pentagramLines(1.25), [])
  const runeGeo = useMemo(() => runeRing(1.55, 48, 0.08), [])
  const hexGeo = useMemo(() => hexagonLoop(0.85), [])
  const innerStarGeo = useMemo(() => {
    const pts = starPoints(3, 0.35)
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [])

  useFrame((_, delta) => {
    if (outerRef.current) outerRef.current.rotation.z += delta * 0.12
    if (midRef.current) midRef.current.rotation.z -= delta * 0.2
    if (innerRef.current) innerRef.current.rotation.z += delta * 0.35
    if (starRef.current) starRef.current.rotation.z -= delta * 0.08
  })

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <group ref={outerRef}>
        <lineLoop>
          <circleGeometry args={[1.65, 72]} />
          <lineBasicMaterial color="#e8c050" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <lineSegments geometry={runeGeo}>
          <lineBasicMaterial color="#d4a84b" transparent opacity={0.75} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <lineLoop>
          <circleGeometry args={[1.38, 64]} />
          <lineBasicMaterial color="#4de8ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </lineLoop>
      </group>

      <group ref={midRef}>
        <lineSegments ref={starRef} geometry={pentagramGeo}>
          <lineBasicMaterial color="#f0d878" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
        </lineSegments>
        <lineLoop geometry={hexGeo}>
          <lineBasicMaterial color="#4de8ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </lineLoop>
      </group>

      <group ref={innerRef}>
        <lineLoop>
          <circleGeometry args={[0.55, 36]} />
          <lineBasicMaterial color="#d4a84b" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <lineSegments geometry={innerStarGeo}>
          <lineBasicMaterial color="#e8c878" transparent opacity={0.55} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>
    </group>
  )
}
