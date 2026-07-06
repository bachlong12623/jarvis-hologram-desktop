import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import type { RefObject } from 'react'
import type { MousePosition } from '../hooks/useMouseParallax'
import { HologramSphere } from './HologramSphere'
import { DataStreams } from './DataStreams'
import { CircuitPlatform } from './CircuitPlatform'
import { ProcessingRings } from './ProcessingRings'
import { MagicCircle } from './MagicCircle'
import { TaoBagua } from './TaoBagua'

function CameraRig({ mouseRef }: { mouseRef: RefObject<MousePosition> }) {
  const { camera } = useThree()

  useFrame(() => {
    const targetX = mouseRef.current.x * 0.25
    const targetY = mouseRef.current.y * 0.2

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.04)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.04)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function Scene({ mouseRef }: { mouseRef: RefObject<MousePosition> }) {
  return (
    <>
      <color attach="background" args={['#010610']} />

      <ambientLight intensity={0.08} />
      <pointLight position={[0, 0, 3]} intensity={0.45} color="#4de8ff" />
      <pointLight position={[3, 2, 2]} intensity={0.8} color="#4de8ff" />
      <pointLight position={[-3, -1, 2]} intensity={0.5} color="#3d8bfd" />
      <pointLight position={[0, -2, 1]} intensity={0.3} color="#00d4ff" />
      <pointLight position={[2, 0, 1]} intensity={0.25} color="#d4a84b" />
      <pointLight position={[-2, 0, 1]} intensity={0.2} color="#c23a2b" />

      <CameraRig mouseRef={mouseRef} />
      <TaoBagua />
      <MagicCircle />
      <HologramSphere />
      <ProcessingRings />
      <DataStreams />
      <CircuitPlatform />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={1.15}
          luminanceThreshold={0.28}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.0005, 0.0005)}
        />
        <Vignette eskil={false} offset={0.15} darkness={0.65} />
      </EffectComposer>
    </>
  )
}

type ExperienceProps = {
  mouseRef: RefObject<MousePosition>
}

export function Experience({ mouseRef }: ExperienceProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div ref={containerRef} className="experience">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene mouseRef={mouseRef} />
      </Canvas>
    </div>
  )
}
