import { AnimatePresence, motion, type PanInfo } from 'framer-motion'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { pexels, srcSet, type Story } from '../data/site'
import { useScrollLock } from '../lib/hooks'
import { EASE } from '../lib/motion'

/* Visor a pantalla completa · fondo casi negro, la foto entera, flechas, contador y pie.
 * Teclado: ← → para pasar, Esc para cerrar. En móvil se pasa deslizando.
 * El foco queda dentro mientras está abierto y vuelve a la foto que lo abrió al cerrar. */
export function Lightbox({ items, index, onClose, onIndex }: { items: Story[]; index: number | null; onClose: () => void; onIndex: (i: number) => void }) {
  const open = index !== null
  const [dir, setDir] = useState(0)
  const dialog = useRef<HTMLDivElement>(null)
  const closeBtn = useRef<HTMLButtonElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  useScrollLock(open)

  const go = useCallback(
    (d: number) => {
      if (index === null) return
      setDir(d)
      onIndex((index + d + items.length) % items.length)
    },
    [index, items.length, onIndex],
  )

  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement as HTMLElement
    closeBtn.current?.focus()
    return () => opener.current?.focus({ preventScroll: true })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
      else if (e.key === 'Tab' && dialog.current) {
        const f = [...dialog.current.querySelectorAll<HTMLElement>('button')].filter((b) => b.offsetParent !== null)
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, go, onClose])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1)
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1)
  }

  const item = index !== null ? items[index] : null
  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de fotografías"
          className="on-dark fixed inset-0 z-[80] flex flex-col bg-[#09090b]/[0.97] text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-4 md:h-20 md:px-8">
            <p className="text-[13px] tabular-nums text-white/70" aria-live="polite">
              {item.n} <span className="text-white/40">/ {String(items.length).padStart(2, '0')}</span>
            </p>
            <button ref={closeBtn} type="button" onClick={onClose} aria-label="Cerrar visor" className="group grid h-11 w-11 place-items-center rounded-full transition-colors hover:bg-white/10">
              <X size={22} strokeWidth={1.5} className="transition-transform duration-300 group-hover:rotate-90" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={item.photo.id}
                custom={dir}
                src={pexels(item.photo.id, 1280)}
                srcSet={srcSet(item.photo.id, [720, 960, 1280, 1600])}
                sizes="(min-width: 768px) 70vw, 100vw"
                alt={item.photo.alt}
                className="max-h-full max-w-full select-none object-contain"
                draggable={false}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.18}
                onDragEnd={onDragEnd}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 60, scale: d ? 1 : 0.96 }),
                  center: { opacity: 1, x: 0, scale: 1 },
                  exit: (d: number) => ({ opacity: 0, x: d * -60 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: EASE }}
              />
            </AnimatePresence>
            <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="group absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 transition-colors hover:border-white/60 md:grid lg:left-8">
              <ArrowLeft size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:-translate-x-[3px]" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="group absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 transition-colors hover:border-white/60 md:grid lg:right-8">
              <ArrowRight size={20} strokeWidth={1.5} className="transition-transform duration-300 group-hover:translate-x-[3px]" />
            </button>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-4 px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 md:px-8 md:pb-8">
            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium md:text-[17px]">{item.title}</p>
              <p className="text-[13px] text-white/60">
                {item.couple} · {item.place}
              </p>
            </div>
            <div className="flex gap-2 md:hidden">
              <button type="button" onClick={() => go(-1)} aria-label="Foto anterior" className="grid h-11 w-11 place-items-center rounded-full border border-white/20">
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Foto siguiente" className="grid h-11 w-11 place-items-center rounded-full border border-white/20">
                <ArrowRight size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
