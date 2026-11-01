import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { ScrollTrigger } from './lib/gsap'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

const root = document.documentElement
const free = () => !root.classList.contains('gi-hold')

// Al soltar la intro de cristal cambia la barra de scroll: recalcula las escenas fijadas.
// Y si se entra con un ancla (#cita, #tratamientos…), va ahí cuando la intro suelta el scroll.
const onFree = () => {
  requestAnimationFrame(() => {
    ScrollTrigger.refresh()
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      el?.scrollIntoView({ block: 'start' })
    }
  })
}
if (free()) window.addEventListener('load', onFree, { once: true })
else {
  const obs = new MutationObserver(() => {
    if (free()) {
      obs.disconnect()
      onFree()
    }
  })
  obs.observe(root, { attributes: true, attributeFilter: ['class'] })
}
// Las fuentes cambian alturas de texto: un refresco más cuando estén listas.
document.fonts?.ready.then(() => ScrollTrigger.refresh())
