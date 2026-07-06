import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { hologramVertex, hologramFragment } from '../shaders/hologram'

const SEGMENTS = 32

function createHologramMaterial(color: string, opacity: number, fresnelPower: number) {
  return new THREE.ShaderMaterial({
    vertexShader: hologramVertex,
    fragmentShader: hologramFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uFresnelPower: { value: fresnelPower },
      uScanlineSpeed: { value: 0.6 },
      uScanlineDensity: { value: 0.18 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })
}

export function HologramSphere() {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const coreGlowRef = useRef<THREE.Mesh>(null)
  const innerWireRef = useRef<THREE.Mesh>(null)
  const midShellRef = useRef<THREE.Mesh>(null)
  const outerWireRef = useRef<THREE.Mesh>(null)
  const auraRef = useRef<THREE.Mesh>(null)
  const icosaRef = useRef<THREE.Mesh>(null)

  const midMaterial = useMemo(
    () => createHologramMaterial('#4de8ff', 0.7, 3.0),
    [],
  )
  const auraMaterial = useMemo(() => {
    const mat = createHologramMaterial('#c0d8f0', 0.4, 2.0)
    mat.uniforms.uScanlineSpeed.value = 0.9
    mat.uniforms.uScanlineDensity.value = 0.22
    return mat
  }, [])

  useFrame((_, delta) => {
    const t = performance.now() * 0.001

    if (coreRef.current) {
      const pulse = 1 + Math.sin(t * 2.2) * 0.03
      coreRef.current.scale.setScalar(pulse)
      const mat = coreRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.32 + Math.sin(t * 2.2) * 0.06
    }

    if (coreGlowRef.current) {
      const glow = 1 + Math.sin(t * 2.2) * 0.05
      coreGlowRef.current.scale.setScalar(glow)
    }

    if (innerWireRef.current) {
      innerWireRef.current.rotation.x += delta * 0.35
      innerWireRef.current.rotation.y -= delta * 0.5
    }

    if (icosaRef.current) {
      icosaRef.current.rotation.x -= delta * 0.25
      icosaRef.current.rotation.y += delta * 0.4
    }

    if (midShellRef.current) {
      midShellRef.current.rotation.y += delta * 0.2
      midShellRef.current.rotation.z -= delta * 0.15
      midMaterial.uniforms.uTime.value = t
    }

    if (outerWireRef.current) {
      outerWireRef.current.rotation.x -= delta * 0.18
      outerWireRef.current.rotation.z += delta * 0.3
    }

    if (auraRef.current) {
      auraRef.current.rotation.y -= delta * 0.2
      auraRef.current.rotation.z += delta * 0.15
      auraMaterial.uniforms.uTime.value = t
    }

    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03
    }
  })

  return (
    <group ref={groupRef}>
      <mesh ref={coreGlowRef}>
        <sphereGeometry args={[0.32, 12, 12]} />
        <meshBasicMaterial
          color="#4de8ff"
          transparent
          opacity={0.06}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={coreRef}>
        <sphereGeometry args={[0.2, SEGMENTS, SEGMENTS]} />
        <meshBasicMaterial
          color="#6ecfff"
          transparent
          opacity={0.38}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={icosaRef}>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshBasicMaterial
          color="#3d8bfd"
          wireframe
          transparent
          opacity={0.45}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={innerWireRef}>
        <sphereGeometry args={[0.58, SEGMENTS, SEGMENTS]} />
        <meshBasicMaterial
          color="#3d8bfd"
          wireframe
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={midShellRef} material={midMaterial}>
        <sphereGeometry args={[0.78, SEGMENTS, SEGMENTS]} />
      </mesh>

      <mesh ref={outerWireRef}>
        <sphereGeometry args={[0.98, SEGMENTS, SEGMENTS]} />
        <meshBasicMaterial
          color="#a8c8e8"
          wireframe
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh ref={auraRef} material={auraMaterial}>
        <sphereGeometry args={[1.12, SEGMENTS, SEGMENTS]} />
      </mesh>
    </group>
  )
}
