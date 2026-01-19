/**
 * Barrel export principal del feature Gráficos Educativos
 * Exporta todo lo necesario para usar el feature desde otros módulos
 */

// ========== DOMINIO ==========
export * from './domain/entities';
export * from './domain/types';
export * from './domain/repositories';

// ========== CASOS DE USO ==========
export * from './application/use-cases';

// ========== INFRAESTRUCTURA ==========
export * from './infrastructure/repositories';
export * from './infrastructure/adapters';

// ========== PRESENTACIÓN ==========
export * from './presentation/components';
export * from './presentation/hooks';

// ========== IMPORTAR ESTILOS GLOBALES ==========
import './presentation/styles/graficos.css';
