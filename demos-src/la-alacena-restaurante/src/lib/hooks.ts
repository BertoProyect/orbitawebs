import { useEffect, useState } from 'react'

/* La intro de cristal (intro.js) pone html.gi-hold mientras dura. La portada espera a que se quite. */
export function useIntroDone() {
  const [done, setDone] = useState(() => !document.documentElement.classList.contains('gi-hold'))
  useEffect(() => {
    if (done) return
    const root = document.documentElement
    const mo = new MutationObserver(() => {
      if (!root.classList.contains('gi-hold')) setDone(true)
    })
    mo.observe(root, { attributes: true, attributeFilter: ['class'] })
    const safety = window.setTimeout(() => setDone(true), 9000)
    return () => {
      mo.disconnect()
      window.clearTimeout(safety)
    }
  }, [done])
  return done
}

function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

/* Parallax solo en escritorio con ratón: en móvil y con «reducir movimiento» va quieto. */
export const useRichMotion = () =>
  useMedia('(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
export const useDesktop = () => useMedia('(min-width: 900px)')

/* Sección visible: la usa la navegación para marcar el apartado activo. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (vis[0]) setActive(vis[0].target.id)
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: [0, 0.01] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])
  return active
}
