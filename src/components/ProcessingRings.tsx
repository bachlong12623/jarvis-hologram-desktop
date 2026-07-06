import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { perf } from '../utils/performanceMode'

function createTickRing(radius: number, ticks: number, tickLen: number) {
  const positions: number[] = []

  for (let i = 0; i < ticks; i++) {
    const angle = (i / ticks) * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    positions.push(cos * radius, sin * radius, 0)
    positions.push(cos * (radius + tickLen), sin * (radius + tickLen), 0)
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

export function ProcessingRings() {
  const ring1Ref = useRef<THREE.LineSegments>(null)
  const ring2Ref = useRef<THREE.LineSegments>(null)
  const tick1Ref = useRef<THREE.LineSegments>(null)
  const tick2Ref = useRef<THREE.LineSegments>(null)

  const tickGeo1 = useMemo(() => createTickRing(1.45, 36, 0.06), [])
  const tickGeo2 = useMemo(() => createTickRing(1.72, 24, 0.05), [])
  const ringSegments = perf.ringSegments

  useFrame((_, delta) => {
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.5
    }
    if (tick1Ref.current) {
      tick1Ref.current.rotation.z += delta * 0.5
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x += delta * 0.35
      ring2Ref.current.rotation.y += delta * 0.2
    }
    if (tick2Ref.current) {
      tick2Ref.current.rotation.x += delta * 0.35
      tick2Ref.current.rotation.y += delta * 0.2
    }
  })

  return (
    <group>
      <group rotation={[Math.PI / 2, 0, 0]}>
        <lineLoop ref={ring1Ref}>
          <circleGeometry args={[1.45, ringSegments]} />
          <lineBasicMaterial color="#4de8ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <lineSegments ref={tick1Ref} geometry={tickGeo1}>
          <lineBasicMaterial color="#e8f4ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>

      <group rotation={[Math.PI / 3.5, Math.PI / 5, 0]}>
        <lineLoop ref={ring2Ref}>
          <circleGeometry args={[1.72, ringSegments]} />
          <lineBasicMaterial color="#4de8ff" transparent opacity={0.35} blending={THREE.AdditiveBlending} />
        </lineLoop>
        <lineSegments ref={tick2Ref} geometry={tickGeo2}>
          <lineBasicMaterial color="#e8f4ff" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>
    </group>
  )
}
