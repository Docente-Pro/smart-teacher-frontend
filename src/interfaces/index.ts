// ============================================
// BARREL FILE - EXPORTA TODAS LAS INTERFACES
// ============================================

// Auth interfaces
export type {
  PlanType,
  UserData,
  JWTPayload,
  EnrichedUser,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutResponse,
  ErrorResponse,
} from './IAuth';

// Auth utilities
export {
  isPremiumUser,
  hasCompleteProfile,
  hasCompleteProblematica,
  getRemainingSessions,
  canCreateSession,
  getPlanDisplayName,
} from './IAuth';

// Otras interfaces del proyecto
export type { IArea } from './IArea';
export type { ICapacidad } from './ICapacidad';
export type { IColegio } from './IColegio';
export type { ICompetencia } from './ICompetencia';
export type { ICriterio } from './ICriterio';
export type { IEducacion } from './IEducacion';
export type { IEnfoqueReceived } from './IEnfoque';
export type { IGrado } from './IGrado';
export type { IProblematica } from './IProblematica';
export type { IUnidad } from './IUnidad';
export type { IUsuario } from './IUsuario';

// Unidad de Aprendizaje — IA (wizard 8 pasos)
export type {
  IUnidadContextoBase,
  IUnidadProblematica,
  IUnidadArea,
  ISituacionSignificativaResponse,
  IEvidencias,
  IEvidenciasResponse,
  IPropositos,
  IAreaProposito,
  ICompetenciaProposito,
  ICompetenciaTransversal,
  IPropositosResponse,
  IAreaComplementaria,
  IAreasComplementariasResponse,
  IEnfoqueUnidad,
  IEnfoquesResponse,
  ISecuencia,
  ISemanaSecuencia,
  IDiaSecuencia,
  ITurnoActividad,
  ISecuenciaResponse,
  IMaterialesResponse,
  IReflexionPregunta,
  IReflexionesResponse,
  PasoUnidad,
  IUnidadContenido,
  IProgresoUnidadResponse,
  IPasoUnidadResponse,
  IUnidadCompleta,
} from './IUnidadIA';

// Interfaces por área (Matemática, Comunicación, etc.)
export * from './areas';
