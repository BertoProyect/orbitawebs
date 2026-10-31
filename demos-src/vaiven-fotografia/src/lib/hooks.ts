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

export function useMedia(q: string) {
  const [m, setM] = useState(() => window.matchMedia(q).matches)
  useEffect(() => {
    const mq = window.matchMedia(q)
    const on = () => setM(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [q])
  return m
}

/* Parallax y efectos ligados al scroll: solo en pantallas grandes con ratón y sin «reducir movimiento».
 * En móvil y tablet táctil el scroll va limpio. */
export const useRichMotion = () =>
  useMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)')
export const useDesktop = () => useMedia('(min-width: 1024px)')
export const useReduced = () => useMedia('(prefers-reduced-motion: reduce)')

/* Capítulo visible: lo usa la navegación para marcar dónde estás. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string>(ids[0])
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const seen = new Map<string, boolean>()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => seen.set(e.target.id, e.isIntersecting))
        const current = ids.filter((id) => seen.get(id)).pop()
        if (current) setActive(current)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    /* Al final de la página el último capítulo es corto y no llega al centro: se marca igual. */
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8) setActive(ids[ids.length - 1])
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [ids])
  return active
}

/* Bloquea el scroll de la página (menú móvil, visor de fotos) sin que salte el contenido. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const html = document.documentElement
    const gap = window.innerWidth - html.clientWidth
    const prev = { o: html.style.overflow, p: html.style.paddingRight }
    html.style.overflow = 'hidden'
    if (gap > 0) html.style.paddingRight = `${gap}px`
    return () => {
      html.style.overflow = prev.o
      html.style.paddingRight = prev.p
    }
  }, [locked])
}
