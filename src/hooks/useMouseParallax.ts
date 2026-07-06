import { useEffect, useRef } from 'react'

export type MousePosition = {
  x: number
  y: number
}

export function useMouseParallax() {
  const mouse = useRef<MousePosition>({ x: 0, y: 0 })

  useEffect(() => {
    const update = (clientX: number, clientY: number) => {
      mouse.current.x = (clientX / window.innerWidth) * 2 - 1
      mouse.current.y = -(clientY / window.innerHeight) * 2 + 1
    }

    const onMouseMove = (e: MouseEvent) => update(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        update(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
    }
  }, [])

  return mouse
}
