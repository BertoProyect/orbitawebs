import { m, useReducedMotion } from "framer-motion";
import { Gift, HeartHandshake, ScanFace, Zap, type LucideIcon } from "lucide-react";
import { TRUST } from "../data/content";
import { EASE } from "./ui";

const ICONS: Record<string, LucideIcon> = { scan: ScanFace, heart: HeartHandshake, zap: Zap, gift: Gift };

export function Trust() {
  const reduce = useReducedMotion();
  return (
    <section id="confianza" aria-label="Por qué Alba Estética" className="border-b border-line">
      <ul className="wrap grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {TRUST.map((t, i) => {
          const Icon = ICONS[t.icon];
          return (
            <m.li
              key={t.title}
              className="flex gap-4 border-t border-line py-7 first:border-t-0 sm:pr-6 sm:[&:nth-child(2)]:border-t-0 lg:border-t-0 lg:py-10"
              initial={reduce ? false : { opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.85, ease: EASE, delay: i * 0.09 }}
            >
              <Icon size={22} strokeWidth={1.4} className="mt-0.5 shrink-0 text-plum" aria-hidden="true" />
              <div>
                <h3 className="font-serif text-[1.25rem] leading-tight font-[400]">{t.title}</h3>
                <p className="mt-1 text-[0.9375rem] text-muted">{t.text}</p>
              </div>
            </m.li>
          );
        })}
      </ul>
    </section>
  );
}
