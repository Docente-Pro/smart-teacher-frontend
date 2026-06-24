import type { CSSProperties, ReactNode } from "react";
import type { ImagenIA } from "@/types/visuales-ia";
import { imagenIAPosicion } from "@/types/visuales-ia";

type Props = {
  imagen: ImagenIA;
  /** Contenido textual principal: estrategias, enunciado, cuerpo de sección, etc. */
  children?: ReactNode;
  crossOrigin?: boolean;
};

const wrapperStyle: CSSProperties = {
  width: "100%",
  margin: "0.45rem 0",
};

const imageStyle: CSSProperties = {
  width: "100%",
  maxWidth: "100%",
  height: "auto",
  objectFit: "contain",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  display: "block",
};

export function ImagenIAVisual({ imagen, children, crossOrigin = true }: Props) {
  const img = (
    <div style={wrapperStyle}>
      <img
        src={imagen.url}
        alt={imagen.descripcion || "Ilustración"}
        className="w-full max-w-full object-contain border border-gray-200 rounded-md"
        style={imageStyle}
        loading="lazy"
        {...(crossOrigin ? { crossOrigin: "anonymous" as const } : {})}
      />
    </div>
  );

  if (!children) return img;

  return imagenIAPosicion(imagen) === "antes" ? (
    <>
      {img}
      {children}
    </>
  ) : (
    <>
      {children}
      {img}
    </>
  );
}
