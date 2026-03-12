import { useEffect, useRef } from "react";
import { useDragAndDrop } from "@formkit/drag-and-drop/react";

const DRAG_HANDLE_SELECTOR = ".secuencia-drag-handle";

type SortableSlotsListProps<T> = {
  items: T[];
  onReorder: (newItems: T[]) => void;
  children: (item: T, index: number) => React.ReactNode;
  /** Key for list identity (e.g. "s0-d1") so each day has its own sortable list */
  listKey: string;
  /** Mismo valor en varias listas permite arrastrar entre días (p. ej. "semana-0-horas") */
  group?: string;
  className?: string;
};

/**
 * Lista ordenable con FormKit Drag & Drop.
 * Solo el handle (selector .secuencia-drag-handle) inicia el arrastre.
 * Sincroniza orden con el padre y evita bucles al recibir items actualizados.
 */
export function SortableSlotsList<T>({
  items,
  onReorder,
  children,
  listKey,
  group,
  className = "space-y-2",
}: SortableSlotsListProps<T>) {
  const [parentRef, values, setValues] = useDragAndDrop<HTMLDivElement, T>(items, {
    dragHandle: DRAG_HANDLE_SELECTOR,
    ...(group != null && { group }),
  });
  const skipNextSyncRef = useRef(false);

  // Sincronizar desde el padre cuando items cambian (p. ej. después de guardar)
  useEffect(() => {
    setValues(items);
    skipNextSyncRef.current = true;
  }, [items, listKey]);

  // Notificar nuevo orden cuando el usuario reordena (evitar loop con skipNextSyncRef)
  useEffect(() => {
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false;
      return;
    }
    onReorder(values);
  }, [values]);

  return (
    <div ref={parentRef} className={className} data-sortable-list-key={listKey}>
      {values.map((item, index) => (
        <div key={`${listKey}-${index}`}>{children(item, index)}</div>
      ))}
    </div>
  );
}
