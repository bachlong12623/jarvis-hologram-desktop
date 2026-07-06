import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const STREAM_COUNT = 12
const BITS_PER_STREAM = 24

export function DataStreams() {
  const groupRef = useRef<THREE.Group>(null)
  const bitsRef = useRef<THREE.InstancedMesh>(null)

  const { offsets, angles, speeds } = useMemo(() => {
    const offsets = new Float32Array(STREAM_COUNT)
    const angles = new Float32Array(STREAM_COUNT)
    const speeds = new Float32Array(STREAM_COUNT)

    for (let i = 0; i < STREAM_COUNT; i++) {
      offsets[i] = Math.random()
      angles[i] = (i / STREAM_COUNT) * Math.PI * 2
      speeds[i] = 0.3 + Math.random() * 0.4
    }

    return { offsets, angles, speeds }
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    if (!bitsRef.current) return
    const t = performance.now() * 0.001

    let idx = 0
    for (let s = 0; s < STREAM_COUNT; s++) {
      const angle = angles[s]
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)

      for (let b = 0; b < BITS_PER_STREAM; b++) {
        const progress = (offsets[s] + b / BITS_PER_STREAM + t * speeds[s] * 0.15) % 1
        const radius = 1.4 + progress * 2.2
        const y = (b % 3 - 1) * 0.04

        dummy.position.set(cos * radius, y, sin * radius)
        dummy.scale.setScalar(0.015 + (1 - progress) * 0.02)
        dummy.updateMatrix()
        bitsRef.current.setMatrixAt(idx++, dummy.matrix)
      }
    }

    bitsRef.current.instanceMatrix.needsUpdate = true

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      <instancedMesh ref={bitsRef} args={[undefined, undefined, STREAM_COUNT * BITS_PER_STREAM]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial
          color="#4de8ff"
          transparent
          opacity={0.55}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </group>
  )
}
