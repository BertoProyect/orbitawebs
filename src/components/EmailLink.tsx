import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

type EmailLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  email: string;
  children: ReactNode;
};

const TOUCH_DEVICE_QUERY = "(hover: none) and (pointer: coarse)";

/**
 * Enlace de correo según el dispositivo:
 * - Móvil y tablet (pantalla táctil): abre directamente la app de correo (mailto:).
 * - Ordenador: abre Gmail web en una pestaña nueva.
 */
export function EmailLink({ email, children, onClick, ...rest }: EmailLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    if (window.matchMedia(TOUCH_DEVICE_QUERY).matches) return;

    event.preventDefault();
    window.open(
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <a href={`mailto:${email}`} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
