import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Tablet, Laptop } from "lucide-react";
import "./IncludesCinematic.css";

gsap.registerPlugin(ScrollTrigger);

export function IncludesCinematic() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

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

      const layers = [
        layerLoadRef.current,
        layerSeoRef.current,
        layerRespRef.current,
        layerChatRef.current,
        layerReportRef.current,
      ] as HTMLElement[];

      // Estado inicial: solo la fase 1 visible
      gsap.set(layers, { display: "none", opacity: 1 });
      gsap.set(layerLoadRef.current, { display: "flex", xPercent: 0 });

      function slideOut(el: HTMLElement | null) {
        if (!el) return gsap.timeline();
        return gsap.to(el, { xPercent: -100, duration: 0.5, ease: "power2.inOut" });
      }
      function slideIn(el: HTMLElement | null) {
        if (!el) return gsap.timeline();
        return gsap.fromTo(el, { xPercent: 100 }, { xPercent: 0, duration: 0.5, ease: "power2.inOut" });
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrap,
          start: "top top",
          end: "+=5200",
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // ===== FASE 1: CARGA =====
      tl.addLabel("load")
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
        .addLabel("seo")
        .add(slideIn(layerSeoRef.current), "-=0.1")
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

        // El marco se pliega a 0px reales y vuelve, ya con "Perfecta en cualquier pantalla"
        .to(frame, { width: "0px", duration: 0.6, ease: "power1.inOut" }, "+=0.25")
        .addLabel("responsive")
        .set(layerSeoRef.current, { xPercent: 0 })
        .to(frame, { width: "min(720px, 86vw)", duration: 0.6, ease: "power1.inOut" })

        // ===== FASE 3 -> 4: RESPONSIVE sale, SOPORTE entra =====
        .add(slideOut(layerRespRef.current), "+=0.6")
        .addLabel("chat")
        .add(slideIn(layerChatRef.current), "-=0.5")
        .fromTo(bubble1Ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, "+=0.15")
        .fromTo(bubble2Ref.current, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }, "+=0.2")
        .add(slideOut(layerChatRef.current), "+=0.4")

        // ===== FASE 5: INFORME =====
        .addLabel("report")
        .add(slideIn(layerReportRef.current), "-=0.5")
        .fromTo(paperRef.current, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.2, ease: "power1.out" })
        .to(paperRef.current, { x: 60, duration: 0.9, ease: "none" })
        .add(slideOut(layerReportRef.current), "+=0.3")
        .to({}, { duration: 0.6 }); // colchón final antes de soltar el pin

      // Visibilidad robusta: se recalcula en cada frame a partir del tiempo real
      // de la timeline (funciona igual scrolleando hacia adelante o hacia atrás)
      const bounds = {
        load: [0, tl.labels.seo],
        seo: [tl.labels.seo, tl.labels.responsive],
        responsive: [tl.labels.responsive, tl.labels.chat],
        chat: [tl.labels.chat, tl.labels.report],
        report: [tl.labels.report, tl.duration() + 0.001],
      };

      function applyVisibility() {
        const t = tl.time();
        const entries: [HTMLElement | null, [number, number]][] = [
          [layerLoadRef.current, bounds.load as [number, number]],
          [layerSeoRef.current, bounds.seo as [number, number]],
          [layerRespRef.current, bounds.responsive as [number, number]],
          [layerChatRef.current, bounds.chat as [number, number]],
          [layerReportRef.current, bounds.report as [number, number]],
        ];
        entries.forEach(([el, [start, end]]) => {
          if (!el) return;
          const shouldShow = t >= start - 0.001 && t < end;
          const isVisible = el.style.display !== "none";
          if (shouldShow && !isVisible) el.style.display = "flex";
          if (!shouldShow && isVisible) el.style.display = "none";
        });
      }

      tl.eventCallback("onUpdate", applyVisibility);
    }, wrap);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} className="relative h-[100dvh] w-full flex flex-col">
      {/* Título: se queda fijo arriba durante toda la animación */}
      <div className="container-page shrink-0 pt-24 pb-6 sm:pt-32">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">
          Qué incluye tu web
        </p>
        <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
          Todas nuestras ventajas
        </h2>
      </div>

      <div className="ic-stage flex-1 w-full">
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
                  <div className="ic-caption-top" style={{ position: "static", marginBottom: "8px" }}>
                    Perfecta en cualquier pantalla
                  </div>
                  <div className="ic-devices-row">
                    <Tablet size={40} strokeWidth={1.6} color="#1A1A2E" />
                    <Laptop size={40} strokeWidth={1.6} color="#1A1A2E" />
                    <div className="ic-device-phone">
                      <div className="ic-device-phone-island" />
                    </div>
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
