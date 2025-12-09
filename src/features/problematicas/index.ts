// ============================================
// BARREL EXPORT - FEATURE PROBLEMÁTICAS
// ============================================

// Interfaces
export type {
  TipoProblematica,
  ProblematicaCreador,
  ProblematicaCount,
  Problematica,
  PaginationInfo,
  ProblematicasResponse,
  ProblematicaQueryParams,
  CreateProblematicaRequest,
  UpdateProblematicaRequest,
  SelectProblematicaRequest,
  SugerenciaPersonalizacion,
  SugerenciasParams,
} from './interfaces/problematica.interface';

// Services
export { problematicaApiService } from './services/problematica-api.service';

// Hooks
export { useProblematicas } from './hooks/useProblematicas';

// Components
export { default as ProblematicasList } from './components/ProblematicasList';
export { default as CreateEditProblematicaModal } from './components/CreateEditProblematicaModal';
export { default as SugerenciasPersonalizacion } from './components/SugerenciasPersonalizacion';
