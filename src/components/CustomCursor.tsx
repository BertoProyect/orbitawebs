import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (!isFinePointer || prefersReducedMotion) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("custom-cursor-active");
    dot.style.display = "block";
    ring.style.display = "block";

    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const interactiveSelector =
      "a, button, [role='button'], input, textarea, select, .cursor-interactive";

    const onOver = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(interactiveSelector);
      if (target) {
        gsap.to(ring, { scale: 2.2, opacity: 0.5, duration: 0.35, ease: "power2.out" });
        gsap.to(dot, { scale: 0, duration: 0.25, ease: "power2.out" });
      }
    };
    const onOut = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest(interactiveSelector);
      if (target) {
        gsap.to(ring, { scale: 1, opacity: 1, duration: 0.35, ease: "power2.out" });
        gsap.to(dot, { scale: 1, duration: 0.25, ease: "power2.out" });
      }
    };

    const onDown = () => gsap.to([dot, ring], { scale: "-=0.25", duration: 0.15 });
    const onUp = () => gsap.to([dot, ring], { scale: "+=0.25", duration: 0.15 });

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        style={{ display: "none" }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary"
        aria-hidden="true"
      />
      <div
        ref={dotRef}
        style={{ display: "none" }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
        aria-hidden="true"
      />
    </>
  );
}
