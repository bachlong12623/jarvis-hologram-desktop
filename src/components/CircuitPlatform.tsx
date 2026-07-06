import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { circuitVertex, circuitFragment } from '../shaders/hologram'

export function CircuitPlatform() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: circuitVertex,
        fragmentShader: circuitFragment,
        uniforms: {
          uTime: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [],
  )

  useFrame(() => {
    material.uniforms.uTime.value = performance.now() * 0.001
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.6, 0]} material={material}>
      <circleGeometry args={[6, 64]} />
    </mesh>
  )
}
