import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

/* GSAP + ScrollTrigger para las escenas ligadas al scroll (fijadas y con scrub).
   useGSAP limpia cada ScrollTrigger al desmontar; gsap.matchMedia separa escritorio,
   móvil y «reducir movimiento» y lo revierte solo cuando cambia la condición. */
gsap.registerPlugin(ScrollTrigger, useGSAP)
ScrollTrigger.config({ ignoreMobileResize: true })

export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
}

export { gsap, ScrollTrigger, useGSAP }
