import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function trigramLines(radius: number) {
  const positions: number[] = []

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 8
    const cx = Math.cos(a) * radius
    const cy = Math.sin(a) * radius
    const perp = a + Math.PI / 2

    for (let j = -1; j <= 1; j++) {
      const ox = Math.cos(perp) * j * 0.06
      const oy = Math.sin(perp) * j * 0.06
      positions.push(cx + ox, cy + oy, 0, cx + ox, cy + oy + 0.12, 0)
    }

    if (i % 2 === 0) {
      positions.push(cx, cy, 0, cx + Math.cos(a) * 0.08, cy + Math.sin(a) * 0.08, 0)
    } else {
      positions.push(cx, cy, 0, cx - Math.cos(perp) * 0.06, cy - Math.sin(perp) * 0.06, 0)
      positions.push(cx, cy, 0, cx + Math.cos(perp) * 0.06, cy + Math.sin(perp) * 0.06, 0)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  return geo
}

export function TaoBagua() {
  const ref = useRef<THREE.Group>(null)
  const trigramGeo = useMemo(() => trigramLines(1.95), [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z -= delta * 0.06
  })

  return (
    <group ref={ref} rotation={[Math.PI / 2.2, 0.15, 0]}>
      <lineLoop>
        <circleGeometry args={[1.95, 64]} />
        <lineBasicMaterial color="#e8453c" transparent opacity={0.45} blending={THREE.AdditiveBlending} />
      </lineLoop>
      <lineSegments geometry={trigramGeo}>
        <lineBasicMaterial color="#e8453c" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </group>
  )
}
