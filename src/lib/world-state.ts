/**
 * Estado compartido entre el HTML de la página y el mundo 3D (OrbitWorld)
 * sin pasar por React: el mundo lo lee en cada fotograma.
 *
 * - processProgress: 0..1 de los pasos de "Proceso" (lo escribe
 *   ProcessShowcase con su ScrollTrigger); mueve la isla del taller.
 */
export const worldState = {
  processProgress: 0,
};

/** Fuente de progreso con forma de ref para ProcessBuild. */
export const processProgressSource = {
  get current() {
    return worldState.processProgress;
  },
};
