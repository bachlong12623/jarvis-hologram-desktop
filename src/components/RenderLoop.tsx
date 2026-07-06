import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

type RenderLoopProps = {
  fps: number
}

export function RenderLoop({ fps }: RenderLoopProps) {
  const invalidate = useThree((state) => state.invalidate)

  useEffect(() => {
    invalidate()

    const interval = window.setInterval(() => {
      if (!document.hidden) invalidate()
    }, 1000 / fps)

    return () => window.clearInterval(interval)
  }, [fps, invalidate])

  useEffect(() => {
    const onVisibility = () => {
      if (!document.hidden) invalidate()
    }

    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [invalidate])

  return null
}
