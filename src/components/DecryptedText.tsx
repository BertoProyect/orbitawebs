import { useEffect, useRef, useState } from "react";

interface DecryptedTextProps {
  text: string;
  active: boolean;
  className?: string;
  speed?: number;
  characters?: string;
}

/**
 * Texto que se "descifra" letra a letra desde caracteres aleatorios hasta el
 * texto real. Se activa cuando `active` pasa a true (p. ej. al abrir un FAQ).
 * Adaptado de react-bits (DecryptedText) sin depender de framer-motion.
 */
export function DecryptedText({
  text,
  active,
  className = "",
  speed = 30,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    if (!active || hasPlayedRef.current) {
      if (!active) hasPlayedRef.current = false;
      return;
    }
    hasPlayedRef.current = true;

    let iteration = 0;
    const totalIterations = text.length * 1.2;

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            const revealPoint = (i / text.length) * totalIterations;
            if (iteration >= revealPoint) return text[i];
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      iteration += 1;
      if (iteration > totalIterations) {
        setDisplayText(text);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, speed);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, text, speed, characters]);

  return <p className={className}>{displayText}</p>;
}
