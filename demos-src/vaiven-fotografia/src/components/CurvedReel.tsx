import { useEffect, useRef } from 'react'

/* Banda curva · port a React de TiltedGridHero, con la misma geometría y los mismos valores
 * que la banda original de Vaivén.
 *
 * Una fila de fotos recorre por dentro un cilindro de derecha a izquierda: el centro queda de
 * frente y los extremos se curvan hacia ti y se funden con la página. Cada foto se corta en
 * SLICES tiras verticales, cada una girada a su sitio en el arco; lo que se mueve es la foto
 * entera (un único rotateY en CSS), así las tiras nunca se separan.
 *
 * Todo el movimiento es una animación CSS: React monta la capa una vez y no vuelve a renderizar.
 * Fuera de pantalla se pausa (IntersectionObserver) y con «reducir movimiento» queda quieta. */

const SLICES = 16
const CAMERA = 1.6
const MAX_WIDTH = 55

type Opts = {
  images: string[]
  speed?: number
  tileHeight?: number
  aspectRatio?: number
  gap?: number
  axis?: number
  curve?: number
  fade?: number
}

const arc = (bend: number) => (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend))
const fix = (n: number, d: number) => +n.toFixed(d)

function measureBand(width: number, height: number, tile: number, aspect: number, gap: number, bend: number) {
  const h = Math.min((tile / 100) * height, ((MAX_WIDTH / 100) * width) / aspect)
  const radius = width * arc(bend)
  if (!(h > 0) || !(radius > 0)) return { columns: 2, sweep: 0, unit: 0, limit: 0 }
  const deg = (rad: number) => (rad * 180) / Math.PI
  const unit = deg(h / radius)
  const pitch = (aspect + gap / 100) * unit
  const limit = deg(bend) + (aspect * unit) / 2
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / pitch)))
  const sweep = fix((columns * pitch) / 2, 4)
  return { columns, sweep, unit: fix(unit, 4), limit: fix(Math.min(sweep, limit), 4) }
}

function mountBand(root: HTMLElement, o: Opts) {
  const images = o.images
  const speed = o.speed ?? 4
  const tileHeight = o.tileHeight ?? 26
  const aspect = o.aspectRatio ?? 16 / 9
  const gap = o.gap ?? 6
  const axis = o.axis ?? 56
  const fade = o.fade ?? 12
  const bend = (Math.min(85, Math.max(5, o.curve ?? 80)) * Math.PI) / 180

  const id = 'v' + Math.random().toString(36).slice(2, 8)
  const orbit = 'tgh-o-' + id
  const tileClass = 'tgh-t-' + id

  const styleEl = document.createElement('style')
  const layer = document.createElement('div')
  layer.className = 'reel__layer'
  layer.setAttribute('aria-hidden', 'true')
  root.prepend(layer)
  root.prepend(styleEl)

  const u = (n: number) => `calc(${fix(n, 4)} * min(${tileHeight}cqh, ${fix(MAX_WIDTH / aspect, 4)}cqw))`
  const r = 100 * arc(bend)
  const radius = fix(r, 3) + 'cqw'
  const turn = (d: number) => `translateZ(${radius}) rotateY(${fix(d, 4)}deg) translateZ(-${radius})`
  const share = aspect / SLICES
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`

  layer.style.perspective = fix(r * CAMERA, 3) + 'cqw'
  layer.style.perspectiveOrigin = `50% ${axis}%`
  layer.style.maskImage = mask
  layer.style.setProperty('-webkit-mask-image', mask)

  /* Se descargan todas antes: cada foto toma la siguiente justo antes de volver a verse */
  images.forEach((src) => {
    const pre = new Image()
    pre.src = src
  })

  let current: ReturnType<typeof measureBand> | null = null

  const build = ({ columns, sweep, limit, unit }: ReturnType<typeof measureBand>) => {
    const duration = columns * speed
    const hide = fix(((sweep - limit) / (2 * sweep || 1)) * 100, 4)

    styleEl.textContent =
      `@keyframes ${orbit}{from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
      `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
      `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
      /* !important: el atajo «animation» en línea de cada foto anularía la pausa */
      `@media(prefers-reduced-motion:reduce){.${tileClass}{animation-play-state:paused!important}}`

    const frag = document.createDocumentFragment()
    for (let t = 0; t < columns; t++) {
      const first = columns - 1 - t
      let shown = first
      const tile = document.createElement('div')
      tile.className = `reel__tile ${tileClass}`
      tile.style.left = `calc(50% - ${u(aspect / 2)})`
      tile.style.top = `calc(${axis}% - ${u(0.5)})`
      tile.style.width = u(aspect)
      tile.style.height = u(1)
      tile.style.animation = `${orbit} ${duration}s linear ${-t * speed}s infinite`

      const imgs: HTMLImageElement[] = []
      const src = images.length ? images[shown % images.length] : ''
      for (let k = 0; k < SLICES; k++) {
        const strip = document.createElement('div')
        strip.className = 'reel__strip' + (k === 0 ? ' reel__strip--first' : '') + (k === SLICES - 1 ? ' reel__strip--last' : '')
        /* Cada tira asoma 1 px por cada lado (salvo los bordes de la foto) para que no se abra
           ninguna rendija entre facetas, se pinten en el orden que se pinten */
        const padL = k === 0 ? 0 : 1
        const padR = k === SLICES - 1 ? 0 : 1
        strip.style.left = `calc(${u((aspect - share) / 2)} - ${padL}px)`
        strip.style.width = `calc(${u(share)} + ${padL + padR}px)`
        strip.style.height = u(1)
        strip.style.transform = turn((aspect / 2 - (k + 0.5) * share) * unit)
        if (src) {
          const img = document.createElement('img')
          img.src = src
          img.alt = ''
          img.draggable = false
          img.decoding = 'async'
          img.style.left = `calc(${u(-k * share)} + ${padL}px)`
          img.style.width = u(aspect)
          img.style.height = u(1)
          strip.appendChild(img)
          imgs.push(img)
        }
        tile.appendChild(strip)
      }

      /* Al dar la vuelta (fuera de la vista) la foto pasa a la siguiente de la lista */
      tile.addEventListener('animationiteration', (e) => {
        if (!images.length) return
        const lap = Math.round((e as AnimationEvent).elapsedTime / duration)
        const next = lap * columns + first
        if (next === shown) return
        shown = next
        const nextSrc = images[next % images.length]
        imgs.forEach((im) => (im.src = nextSrc))
      })
      frag.appendChild(tile)
    }
    layer.replaceChildren(frag)
    layer.classList.add('is-ready')
  }

  const relayout = (width: number, height: number) => {
    const next = measureBand(width, height, tileHeight, aspect, gap, bend)
    if (current && current.columns === next.columns && current.sweep === next.sweep && current.unit === next.unit) return
    current = next
    build(next)
  }

  const ro = new ResizeObserver((entries) => {
    const box = entries[0].contentRect
    relayout(box.width, box.height)
  })
  ro.observe(root)

  /* Fuera de pantalla no se anima: ni CPU ni batería. */
  const io = new IntersectionObserver(([e]) => root.classList.toggle('is-paused', !e.isIntersecting), { rootMargin: '120px 0px' })
  io.observe(root)

  return () => {
    ro.disconnect()
    io.disconnect()
    layer.remove()
    styleEl.remove()
  }
}

export function CurvedReel({ images, caption, ...opts }: Opts & { caption?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const supportsCq = typeof CSS !== 'undefined' && CSS.supports?.('width: 1cqw')
    if (!supportsCq || !images.length) return
    return mountBand(el, { images, ...opts })
    // La banda se monta una sola vez: sus parámetros son fijos.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div ref={ref} className="reel" role="img" aria-label={caption ?? 'Fotografías de bodas recientes'}>
      {caption && (
        <p className="absolute inset-x-0 bottom-5 z-[1] px-5 text-center text-[13px] text-muted md:bottom-7 md:text-[14px]">{caption}</p>
      )}
    </div>
  )
}
