import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Tablet, Laptop, Smartphone } from "lucide-react";
import "./IncludesCinematic.css";

gsap.registerPlugin(ScrollTrigger);

export function IncludesCinematic() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const captionAboveRef = useRef<HTMLDivElement>(null);

  const layerLoadRef = useRef<HTMLDivElement>(null);
  const layerSeoRef = useRef<HTMLDivElement>(null);
  const layerRespRef = useRef<HTMLDivElement>(null);
  const layerChatRef = useRef<HTMLDivElement>(null);
  const layerReportRef = useRef<HTMLDivElement>(null);

  const stopwatchRef = useRef<HTMLDivElement>(null);
  const loadFillRef = useRef<HTMLDivElement>(null);
  const seoRingRef = useRef<HTMLDivElement>(null);
  const seoScoreRef = useRef<HTMLSpanElement>(null);
  const bubble1Ref = useRef<HTMLDivElement>(null);
  const bubble2Ref = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    const frame = frameRef.current;
    if (!wrap || !frame) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const stopwatchObj = { val: 0 };
      const seoObj = { val: 0 };

      // Corte seco: sin fundido de opacidad, solo desplazamiento lateral
      function slideOut(el: Element | null) {
        if (!el) return gsap.timeline();
        gsap.set(el, { opacity: 1 });
        return gsap.to(el, {
          xPercent: -100,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => gsap.set(el, { pointerEvents: "none" }),
        });
      }
      function slideIn(el: Element | null) {
        if (!el) return gsap.timeline();
        gsap.set(el, { xPercent: 100, opacity: 1, pointerEvents: "auto" });
        return gsap.to(el, { xPercent: 0, duration: 0.5, ease: "power2.inOut" });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "+=4500",
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // Blindaje: todas las capas excepto la primera arrancan ocultas de verdad,
      // sin depender de que el CSS externo cargue a tiempo
      gsap.set(
        [layerSeoRef.current, layerRespRef.current, layerChatRef.current, layerReportRef.current],
        { opacity: 0, pointerEvents: "none" }
      );
      gsap.set(captionAboveRef.current, { opacity: 0 });

      // ===== FASE 1: CARGA =====
      tl.set(layerLoadRef.current, { opacity: 1, xPercent: 0 })
        .to(stopwatchObj, {
          val: 0.9,
          duration: 0.7,
          ease: "power1.out",
          onUpdate: () => {
            if (stopwatchRef.current)
              stopwatchRef.current.textContent = stopwatchObj.val.toFixed(1) + "s";
          },
        }, 0)
        .to(loadFillRef.current, { width: "100%", duration: 0.7, ease: "power1.out" }, 0)
        .add(slideOut(layerLoadRef.current), "+=0.2")

        // ===== FASE 2: SEO =====
        .add(slideIn(layerSeoRef.current), "-=0.5")
        .to(seoObj, {
          val: 100,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            if (seoScoreRef.current) seoScoreRef.current.textContent = String(Math.round(seoObj.val));
            const deg = (seoObj.val / 100) * 360;
            if (seoRingRef.current)
              seoRingRef.current.style.background = `conic-gradient(var(--color-primary) ${deg}deg, #E9EEF6 ${deg}deg)`;
          },
        })

        // La pantalla se pliega hacia dentro pixel a pixel hasta 0, y vuelve a la normalidad
        // ya mostrando "Perfecta en cualquier pantalla"
        .to(frame, { width: "0px", duration: 0.6, ease: "power1.inOut" }, "+=0.25")
        .set(layerSeoRef.current, { opacity: 0, pointerEvents: "none" })
        .set(layerRespRef.current, { opacity: 1, xPercent: 0, pointerEvents: "auto" })
        .set(captionAboveRef.current, { opacity: 1 })
        .to(frame, { width: "min(720px, 86vw)", duration: 0.6, ease: "power1.inOut" })

        // ===== FASE 3 -> 4: RESPONSIVE sale, SOPORTE entra =====
        .to(captionAboveRef.current, { opacity: 0, duration: 0.3 }, "+=0.6")
        .add(slideOut(layerRespRef.current), "<")
        .add(slideIn(layerChatRef.current), "-=0.5")
        .fromTo(bubble1Ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, "+=0.15")
        .fromTo(bubble2Ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2")
        .add(slideOut(layerChatRef.current), "+=0.4")

        // ===== FASE 5: INFORME =====
        .add(slideIn(layerReportRef.current), "-=0.5")
        .fromTo(paperRef.current, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "power1.out" })
        .to(paperRef.current, { x: 60, duration: 0.9, ease: "none" })
        .to({}, { duration: 0.4 });
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[100dvh] w-full">
      <div className="ic-stage h-full w-full">
        <div ref={captionAboveRef} className="ic-caption-above">
          Perfecta en cualquier pantalla
        </div>
        <div ref={frameRef} className="ic-frame">
          <div className="ic-frame-bar">
            <span /><span /><span />
          </div>
          <div className="ic-stage-body">
            {/* FASE 1: CARGA */}
            <div ref={layerLoadRef} className="ic-layer">
              <div ref={stopwatchRef} className="ic-stopwatch">0.0s</div>
              <div className="ic-load-bar-track">
                <div ref={loadFillRef} className="ic-load-bar-fill" />
              </div>
              <div className="ic-load-caption">Webs súper veloces</div>
            </div>

            {/* FASE 2: SEO */}
            <div ref={layerSeoRef} className="ic-layer">
              <div className="ic-seo-caption">Eres el primero en Google</div>
              <div ref={seoRingRef} className="ic-seo-ring">
                <span ref={seoScoreRef} className="ic-seo-score">0</span>
              </div>
              <div className="ic-seo-label">SEO</div>
            </div>

            {/* FASE 3: RESPONSIVE */}
            <div ref={layerRespRef} className="ic-layer" style={{ padding: 0 }}>
              <div className="ic-resp-inner">
                <div className="ic-resp-nav">
                  <div className="ic-resp-logo">tunegocio.com</div>
                  <div className="ic-resp-links">
                    <span>Inicio</span><span>Servicios</span><span>Contacto</span>
                  </div>
                </div>
                <div className="ic-resp-body">
                  <div className="ic-devices-row">
                    <Tablet size={38} strokeWidth={1.6} color="#1A1A2E" />
                    <Laptop size={38} strokeWidth={1.6} color="#1A1A2E" />
                    <Smartphone size={38} strokeWidth={1.6} color="#1A1A2E" />
                  </div>
                </div>
              </div>
            </div>

            {/* FASE 4: SOPORTE */}
            <div ref={layerChatRef} className="ic-layer" style={{ paddingTop: "50px", gap: "8px" }}>
              <div className="ic-caption-top">Soporte cercano</div>
              <div className="ic-phone-mock">
                <div className="ic-phone-notch" />
                <div className="ic-phone-header">Órbita Webs</div>
                <div className="ic-phone-chat">
                  <div ref={bubble1Ref} className="ic-chat-bubble me">
                    Hola, ¿podemos cambiar un texto?
                  </div>
                  <div ref={bubble2Ref} className="ic-chat-bubble orbita">
                    ¡Claro! Lo tienes en 5 minutos
                  </div>
                </div>
                <div className="ic-phone-home" />
              </div>
            </div>

            {/* FASE 5: INFORME */}
            <div ref={layerReportRef} className="ic-layer" style={{ gap: "10px" }}>
              <div className="ic-caption-top" style={{ top: "64px" }}>
                Informe semanal de progreso
              </div>
              <div className="ic-handoff-scene">
                <div className="ic-person a"><div className="ic-head" /><div className="ic-body" /></div>
                <div ref={paperRef} className="ic-paper"><span /><span /><span /></div>
                <div className="ic-person b"><div className="ic-head" /><div className="ic-body" /></div>
              </div>
              <p className="ic-report-caption">
                Cada semana te contamos cómo hemos avanzado en tu web.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
