import type { StaticImageData } from "next/image";
import logoChin from "@/assets/logo-chin-ballon-d-or.png";
import logoEntrenador from "@/assets/logo-entrenador.png";
import logoEquipo from "@/assets/logo-equipo.png";
import logoMensaje from "@/assets/logo-mensaje.png";
import logoMrParley from "@/assets/logo-mr-parley.png";
import logoOlivada from "@/assets/logo-olivada.png";

export type CategoryLogo = {
  src: StaticImageData;
  wide?: boolean;
};

export const CATEGORY_LOGOS: Record<string, CategoryLogo> = {
  balon: { src: logoChin },
  olivada: { src: logoOlivada },
  puskas: { src: logoMensaje },
  mejor5: { src: logoEquipo },
  entrenador: { src: logoEntrenador },
  entrenadores: { src: logoEntrenador },
  parley: { src: logoMrParley, wide: true },
};

export function mainLogo(): StaticImageData {
  return logoChin;
}
