import { useEffect, useState } from 'react'

/* La intro de cristal (assets/intro.js) pone gi-hold en <html> mientras dura.
   La portada espera a que se quite para empezar su propia secuencia. */
const holding = () => typeof document !== 'undefined' && document.documentElement.classList.contains('gi-hold')

export function useIntroDone() {
  const [done, setDone] = useState(() => !holding())
  useEffect(() => {
    if (done) return
    const root = document.documentElement
    const check = () => {
      if (!holding()) {
        setDone(true)
        obs.disconnect()
      }
    }
    const obs = new MutationObserver(check)
    obs.observe(root, { attributes: true, attributeFilter: ['class'] })
    const t = window.setTimeout(() => setDone(true), 6000) // red de seguridad
    check()
    return () => {
      obs.disconnect()
      window.clearTimeout(t)
    }
  }, [done])
  return done
}

export function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const m = window.matchMedia(query)
    const on = () => setMatch(m.matches)
    on()
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

/* Puntero fino (ratón/trackpad): solo ahí hay cursor propio y botones magnéticos. */
export const useFinePointer = () => useMedia('(hover: hover) and (pointer: fine)')
export const useDesktop = () => useMedia('(min-width: 1024px)')

/* Sección visible ahora mismo, para el indicador del menú. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    if (!els.length) return
    const pick = () => {
      const y = window.innerHeight * 0.38
      // La sección que empieza más abajo sin pasar de la línea de lectura (no depende del orden del menú).
      let cur = ids[0]
      let best = -Infinity
      for (const el of els) {
        const top = el.getBoundingClientRect().top
        if (top <= y && top > best) {
          best = top
          cur = el.id
        }
      }
      setActive(cur)
    }
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(pick)
    }
    pick()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [ids])
  return active
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}
