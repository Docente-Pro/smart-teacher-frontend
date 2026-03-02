import { useEffect } from "react";

/**
 * Hook reutilizable para scroll al tope cada vez que cambia el paso del wizard.
 * Usar en cualquier página con stepper/wizard para garantizar que el usuario
 * siempre vea el contenido desde arriba al avanzar o retroceder.
 *
 * @param step - El paso actual del wizard (number)
 */
export function useScrollTopOnStep(step: number) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [step]);
}
