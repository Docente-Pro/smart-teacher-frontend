/**
 * patchDomForReact.ts
 *
 * Parche defensivo para evitar el error:
 *   "NotFoundError: Failed to execute 'removeChild' on 'Node':
 *    The node to be removed is not a child of this node."
 *
 * Causa raíz: herramientas externas (Google Translate, extensiones de
 * navegador, lectores de pantalla, etc.) modifican nodos de texto dentro
 * del DOM que React administra. Cuando React intenta reconciliar el
 * Virtual DOM con el DOM real, los nodos ya no están donde esperaba.
 *
 * Solución: interceptar `removeChild` e `insertBefore` en Node.prototype
 * para manejar gracefully el caso en que el nodo hijo no pertenece al
 * padre esperado. En vez de lanzar un error fatal, buscamos al padre
 * real y operamos allí.
 *
 * Referencia: https://github.com/facebook/react/issues/11538#issuecomment-417504600
 *
 * ⚠️ Este archivo DEBE importarse ANTES de React (antes de main.tsx / createRoot).
 */

if (typeof Node !== "undefined" && Node.prototype) {
  // ── removeChild ──────────────────────────────────────────────────────
  const originalRemoveChild = Node.prototype.removeChild;

  // @ts-ignore — override intencional de firma nativa
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      // El nodo ya no es hijo de este padre (probablemente movido por
      // Google Translate u otra herramienta externa). Intentar remover
      // desde su padre real; si no tiene padre, simplemente retornar.
      if (child.parentNode) {
        if (typeof console !== "undefined" && console.warn) console.warn(
          "[patchDomForReact] removeChild: nodo movido externamente, redirigiendo a parentNode real.",
        );
        return originalRemoveChild.call(child.parentNode, child) as T;
      }
      // Ya no está en el DOM — nada que hacer
      return child;
    }
    return originalRemoveChild.call(this, child) as T;
  };

  // ── insertBefore ─────────────────────────────────────────────────────
  const originalInsertBefore = Node.prototype.insertBefore;

  // @ts-ignore — override intencional de firma nativa
  Node.prototype.insertBefore = function <T extends Node>(
    newNode: T,
    referenceNode: Node | null,
  ): T {
    if (referenceNode && referenceNode.parentNode !== this) {
      // El nodo de referencia fue movido externamente.
      // Fallback: insertar al final (appendChild equivalente).
      console.warn(
        "[patchDomForReact] insertBefore: referenceNode movido externamente, usando appendChild.",
      );
      return originalInsertBefore.call(this, newNode, null) as T;
    }
    return originalInsertBefore.call(this, newNode, referenceNode) as T;
  };
}
