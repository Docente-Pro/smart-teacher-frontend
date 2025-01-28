import { IUsuario } from "@/interfaces/IUsuario";

export const initialStateUsuario: IUsuario = {
  id: "",
  nombre: "",
  unidadId: 0,
  fechaInicio: new Date(),
  fechaFin: new Date(),
  problematicaId: 0,
  gradoId: 0,
  educacionId: 0,
  respondioCuestionario: false,
  nombreInstitucion: "",
};
