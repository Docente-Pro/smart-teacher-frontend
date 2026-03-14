import React from "react";

interface Props {
  children: React.ReactNode;
  /** Componente a mostrar cuando hay un error irrecuperable */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary global — última red de seguridad.
 *
 * Captura errores de renderizado (incluidos los de removeChild por
 * manipulación externa del DOM) e intenta re-montar el árbol
 * automáticamente o muestra un fallback amigable.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Si el error es un removeChild/insertBefore por DOM externo,
    // re-montar silenciosamente en vez de mostrar pantalla de error
    const isDomMutation =
      error.name === "NotFoundError" ||
      error.message?.includes("removeChild") ||
      error.message?.includes("insertBefore");

    if (isDomMutation) {
      if (typeof console !== "undefined" && console.warn) console.warn(
        "[ErrorBoundary] Error de DOM externo detectado, re-montando…",
        error.message,
      );
      // Forzar re-render limpio
      this.setState({ hasError: false });
      return;
    }

    console.error("[ErrorBoundary] Error no recuperable:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
              padding: "2rem",
              textAlign: "center",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              Algo salió mal
            </h2>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>
              Ha ocurrido un error inesperado.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                padding: "0.5rem 1.5rem",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                cursor: "pointer",
                fontSize: "0.875rem",
              }}
            >
              Reintentar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
