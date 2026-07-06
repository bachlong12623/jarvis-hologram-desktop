import { useMouseParallax } from './hooks/useMouseParallax'
import { Experience } from './components/Experience'
import { HudOverlay } from './components/HudOverlay'

function App() {
  const mouseRef = useMouseParallax()

  return (
    <div className="app">
      <Experience mouseRef={mouseRef} />
      <HudOverlay mouseRef={mouseRef} />
    </div>
  )
}

export default App
