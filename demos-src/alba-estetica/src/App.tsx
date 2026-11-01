import { domMax, LazyMotion, MotionConfig } from "framer-motion";
import { About } from "./components/About";
import { CitaPanel } from "./components/CitaPanel";
import { Contact } from "./components/Contact";
import { Cursor } from "./components/Cursor";
import { Experience } from "./components/Experience";
import { FaceMap } from "./components/FaceMap";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";
import { Gift } from "./components/Gift";
import { Hero } from "./components/Hero";
import { Laser } from "./components/Laser";
import { Nav, ScrollProgress } from "./components/Nav";
import { Quiz } from "./components/Quiz";
import { Statement } from "./components/Statement";
import { Team } from "./components/Team";
import { Testimonials } from "./components/Testimonials";
import { Treatments } from "./components/Treatments";
import { Trust } from "./components/Trust";
import { useIntroDone } from "./hooks/useIntroDone";
import { CitaProvider } from "./state/cita";

/* Recorrido en escenas:
   1 Primera impresión (Hero) · 2 Filosofía (Statement) · 3 Descubrimiento (Treatments)
   4 Mapa del rostro · 5 Láser · 6 Experiencia humana (Experience + Team) · 7 Invitación final (Contact) */
export default function App() {
  const ready = useIntroDone();
  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <CitaProvider>
          <a
            href="#contenido"
            className="sr-only-focusable fixed left-4 top-4 z-[90] rounded-full bg-plum px-5 py-3 text-white"
          >
            Saltar al contenido
          </a>
          <ScrollProgress />
          <Nav ready={ready} />
          <main id="contenido" tabIndex={-1} className="outline-none">
            <Hero ready={ready} />
            <Trust />
            <Statement />
            <About />
            <Treatments />
            <FaceMap />
            <Quiz />
            <Laser />
            <Experience />
            <Team />
            <Testimonials />
            <Gift />
            <Faq />
            <Contact />
          </main>
          <Footer />
          <CitaPanel ready={ready} />
          <Cursor />
        </CitaProvider>
      </MotionConfig>
    </LazyMotion>
  );
}
