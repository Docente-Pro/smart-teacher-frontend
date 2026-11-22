// Se importa al inicio de main.tsx, antes de que los stores de Zustand se rehidraten.
import { cleanupLegacyInsigniaStorage, runOneTimeStorageCleanup } from "./insigniaCache";

// 1) Una sola vez por navegador: borra la insignia y cachés pesados (basta con F5).
runOneTimeStorageCleanup();
// 2) En cada carga: red de seguridad si vuelve a aparecer una insignia sin comprimir.
cleanupLegacyInsigniaStorage();
