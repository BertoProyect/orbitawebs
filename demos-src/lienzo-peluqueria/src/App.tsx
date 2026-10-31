import { domMax, LazyMotion, MotionConfig } from "framer-motion";
import { Booking } from "./components/Booking";
import { ColorLab } from "./components/ColorLab";
import { Experience } from "./components/Experience";
import { Faq } from "./components/Faq";
import { Floating } from "./components/Floating";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Location } from "./components/Location";
import { Nav, ScrollProgress } from "./components/Nav";
import { ReturnTimer } from "./components/ReturnTimer";
import { Services } from "./components/Services";
import { Statement } from "./components/Statement";
import { Team } from "./components/Team";
import { Testimonials } from "./components/Testimonials";
import { useIntroDone } from "./hooks/useIntroDone";
import { BookingProvider } from "./state/booking";
import { HairProvider } from "./state/hair";

export default function App() {
  const ready = useIntroDone();
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <BookingProvider>
          <HairProvider>
            <a
              href="#contenido"
              className="sr-only-focusable fixed left-4 top-4 z-[70] rounded-full bg-gold px-5 py-3 text-bg"
            >
              Saltar al contenido
            </a>
            <ScrollProgress />
            <Nav ready={ready} />
            <main id="contenido" tabIndex={-1} className="outline-none">
              <Hero ready={ready} />
              <Statement />
              <Experience />
              <Services />
              <ColorLab />
              <ReturnTimer />
              <Team />
              <Testimonials />
              <Booking />
              <Location />
              <Faq />
            </main>
            <Footer />
            <Floating ready={ready} />
          </HairProvider>
        </BookingProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
