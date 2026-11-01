import catalog from "./catalog.json";

export type CategoryId = "faciales" | "corporales" | "cejas" | "manos" | "laser";

export type Treatment = {
  id: string;
  cat: CategoryId;
  group?: string;
  name: string;
  /** null en el láser: la duración depende de la zona y se confirma en cabina */
  mins: number | null;
  price: number;
  desc: string;
};

export const CATEGORIES = catalog.categories as { id: CategoryId; label: string }[];
export const TREATMENTS = catalog.items as Treatment[];

const byId = new Map(TREATMENTS.map((t) => [t.id, t]));
export const getTreatment = (id: string) => byId.get(id);
export const inCategory = (cat: CategoryId) => TREATMENTS.filter((t) => t.cat === cat);

/* Zonas del láser, agrupadas como en la carta */
export const LASER_AREAS = TREATMENTS.filter((t) => t.cat === "laser");
export const LASER_GROUPS = ["Rostro", "Brazos y torso", "Piernas e ingles"].map((g) => ({
  name: g,
  items: LASER_AREAS.filter((t) => t.group === g),
}));

/* Etiqueta de un servicio dentro de la cita */
export const treatmentLabel = (t: Treatment) =>
  t.cat === "laser" ? `Láser de diodo · ${t.name}` : t.name;
