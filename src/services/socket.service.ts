import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/store/auth.store";

// ============================================
// Socket.IO — Conexión autenticada
// Namespace: /  (mismo host que la API)
// ============================================

// Derivar la URL base del socket desde la misma variable que usa la API,
// quitando el sufijo /api si lo tiene (el socket se conecta a la raíz).
const SOCKET_URL = (
  //import.meta.env.VITE_PRODUCTION_API_URL ||
  //import.meta.env.VITE_LOCAL_API_URL ||
  "http://localhost:3000/api"
).replace(/\/api\/?$/, "");

let socket: Socket | null = null;

// ─── Eventos que el frontend escucha ───

export interface PagoConfirmadoPayload {
  pagoId: string;
  monto: number;
  plan: string;
  fechaFin: string;
  accion?: "CREAR_UNIDAD" | "UNIDAD_ACTIVADA";
  tipoUnidad?: "PERSONAL" | "COMPARTIDA";
  planActualizado?: string;
  codigoCompartido?: string;
  [key: string]: unknown;
}

export interface PagoRechazadoPayload {
  pagoId: string;
  motivoRechazo: string;
  [key: string]: unknown;
}

export interface PagoNuevoPendientePayload {
  pagoId: string;
  monto: number;
  usuario: { id: string; nombre: string; email: string };
  [key: string]: unknown;
}

export interface SuscripcionActivadaPayload {
  plan: "premium_mensual" | "premium_anual";
  suscripcionActiva: boolean;
  sesionesRestantes: number;
  sesionesUsadas: number;
  mensaje?: string;
  [key: string]: unknown;
}

export interface SuscripcionRevocadaPayload {
  action: "force-logout";
  motivo: string;
  planAnterior: string;
  message: string;
  [key: string]: unknown;
}

export interface SuscripcionExpiradaPayload {
  action: "show-renewal";
  message?: string;
  [key: string]: unknown;
}

export interface UsuarioReseteadoPayload {
  message: string;
  action: "force-logout";
  sesionesEliminadas: number;
  unidadesEliminadas: number;
  suscripcionRevocada: boolean;
  planAnterior: string;
  [key: string]: unknown;
}

export interface WordListoPayload {
  jobId: string;
  wordUrl: string;
}

export interface WordErrorPayload {
  jobId: string;
  message: string;
}

export type SocketEventMap = {
  "pago:confirmado": PagoConfirmadoPayload;
  "pago:rechazado": PagoRechazadoPayload;
  "pago:nuevo-pendiente": PagoNuevoPendientePayload;
  "suscripcion:activada": SuscripcionActivadaPayload;
  "suscripcion:revocada": SuscripcionRevocadaPayload;
  "suscripcion:expirada": SuscripcionExpiradaPayload;
  "usuario:reseteado": UsuarioReseteadoPayload;
  "word:listo": WordListoPayload;
  "word:error": WordErrorPayload;
};

// ─── Conexión ───

/** userId pendiente de join (se emite al conectar/reconectar) */
let pendingUserId: string | null = null;

/**
 * Conecta al servidor Socket.IO con el token de Auth0.
 * Si ya hay una conexión activa, la retorna sin reconectar.
 */
export function conectarSocket(): Socket {
  if (socket?.connected) return socket;

  // Si ya existe un socket desconectado, reconectar
  if (socket) {
    socket.connect();
    return socket;
  }

  const { accessToken } = useAuthStore.getState();

  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ["websocket", "polling"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on("connect", () => {
    // Al conectar/reconectar, unirse automáticamente a la sala del usuario
    if (pendingUserId) {
      socket?.emit("join-user", pendingUserId);
    }
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket.IO error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    // Socket.IO desconectado
  });

  return socket;
}

/**
 * Emite `join-user` para que el docente entre a su sala personal.
 * Si el socket aún no está conectado, lo guarda para emitir al conectar.
 */
export function joinUserRoom(userId: string): void {
  pendingUserId = userId;
  const s = getSocket();
  if (s?.connected) {
    s.emit("join-user", userId);
  } else {
  }
}

/**
 * Emite `join-admin` para que el admin entre a la sala de admin.
 */
export function joinAdminRoom(): void {
  const s = getSocket();
  s?.emit("join-admin");
}

/**
 * Escucha un evento tipado del socket.
 * @returns Función para dejar de escuchar (cleanup).
 */
export function onSocketEvent<K extends keyof SocketEventMap>(
  evento: K,
  callback: (payload: SocketEventMap[K]) => void
): () => void {
  const s = getSocket();
  s?.on(evento as string, callback as (...args: unknown[]) => void);
  return () => {
    s?.off(evento as string, callback as (...args: unknown[]) => void);
  };
}

/**
 * Devuelve la instancia del socket (puede ser null si no se ha conectado).
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Desconecta el socket y limpia la referencia.
 */
export function desconectarSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    pendingUserId = null;
  }
}
