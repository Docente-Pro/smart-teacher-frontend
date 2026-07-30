import { useState } from "react";

type PreviewKind = "sesion" | "unidad";

const previews: Record<
  PreviewKind,
  {
    label: string;
    description: string;
    contents: string[];
    pages: { src: string; alt: string; className: string }[];
    badge: string;
  }
> = {
  sesion: {
    label: "Sesión",
    description:
      "Una sesión completa y contextualizada, lista para editar en Word o descargar en PDF.",
    contents: [
      "Datos, competencias y propósito",
      "Inicio, desarrollo y cierre",
      "Actividades y recursos visuales",
      "Evaluación y evidencias",
    ],
    pages: [
      {
        src: "/landing/session-preview/planificacion.png",
        alt: "Página de planificación, competencias y momentos de una sesión",
        className:
          "absolute left-[2%] top-[8%] w-[43%] -rotate-6 rounded-[18px] border-[6px] border-white bg-white shadow-[0_28px_70px_rgba(60,88,128,0.2)] sm:rounded-[24px] sm:border-[8px]",
      },
      {
        src: "/landing/session-preview/solucion.png",
        alt: "Página con la estrategia y solución explicada para el aula",
        className:
          "absolute right-[1%] top-[13%] w-[43%] rotate-6 rounded-[18px] border-[6px] border-white bg-white shadow-[0_28px_70px_rgba(60,88,128,0.18)] sm:rounded-[24px] sm:border-[8px]",
      },
      {
        src: "/landing/session-preview/desarrollo.png",
        alt: "Página de desarrollo con un recurso visual contextualizado",
        className:
          "absolute left-1/2 top-[2%] z-[1] w-[50%] -translate-x-1/2 rounded-[20px] border-[7px] border-white bg-white shadow-[0_34px_90px_rgba(60,88,128,0.26)] sm:rounded-[28px] sm:border-[10px]",
      },
    ],
    badge: "Editable en Word y PDF",
  },
  unidad: {
    label: "Unidad",
    description:
      "Una unidad completa: situación, competencias, secuencia por semanas y evaluación, lista para el aula.",
    contents: [
      "Situación y propósito de la unidad",
      "Competencias por área y criterios",
      "Secuencia semanal de actividades",
      "Producto integrador y evaluación",
    ],
    pages: [
      {
        src: "/landing/unit-preview/competencias.png",
        alt: "Tabla de competencias, criterios y actividades de una unidad",
        className:
          "absolute left-[2%] top-[8%] w-[43%] -rotate-6 rounded-[18px] border-[6px] border-white bg-white shadow-[0_28px_70px_rgba(60,88,128,0.2)] sm:rounded-[24px] sm:border-[8px]",
      },
      {
        src: "/landing/unit-preview/enfoques.png",
        alt: "Competencias transversales, enfoques y secuencia de la unidad",
        className:
          "absolute right-[1%] top-[13%] w-[43%] rotate-6 rounded-[18px] border-[6px] border-white bg-white shadow-[0_28px_70px_rgba(60,88,128,0.18)] sm:rounded-[24px] sm:border-[8px]",
      },
      {
        src: "/landing/unit-preview/secuencia.png",
        alt: "Horario semanal de actividades de la unidad de aprendizaje",
        className:
          "absolute left-1/2 top-[2%] z-[1] w-[50%] -translate-x-1/2 rounded-[20px] border-[7px] border-white bg-white shadow-[0_34px_90px_rgba(60,88,128,0.26)] sm:rounded-[28px] sm:border-[10px]",
      },
    ],
    badge: "Editable en Word y PDF",
  },
};

function SessionPreview() {
  const [kind, setKind] = useState<PreviewKind>("sesion");
  const preview = previews[kind];

  return (
    <section className="overflow-hidden bg-[#EAF2FC]/55 px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
        <div className="dp-enter max-w-xl">
          <h2 className="text-balance text-4xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-5xl">
            Mira lo que recibirás
          </h2>
          <p className="mt-5 max-w-[40ch] text-xl font-semibold leading-8 text-[#6B7280]">
            {preview.description}
          </p>

          <div
            className="mt-7 inline-flex rounded-[18px] bg-white p-1.5 shadow-[0_10px_30px_rgba(60,88,128,0.08)] ring-1 ring-[#E6EBF2]"
            role="tablist"
            aria-label="Tipo de documento"
          >
            {(Object.keys(previews) as PreviewKind[]).map((key) => {
              const selected = kind === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setKind(key)}
                  className={`dp-press min-h-11 rounded-[14px] px-5 text-base font-extrabold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)] ${
                    selected
                      ? "bg-[#6B9FE8] text-white shadow-[0_8px_18px_rgba(107,159,232,0.28)]"
                      : "text-[#3B6CB5] hover:bg-[#EAF2FC]"
                  }`}
                >
                  {previews[key].label}
                </button>
              );
            })}
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {preview.contents.map((item, index) => (
              <li
                key={`${kind}-${item}`}
                className="flex min-h-12 items-center gap-4 text-lg font-extrabold text-[#1F2937]"
              >
                <span
                  className={`grid h-10 w-10 shrink-0 place-items-center rounded-[14px] text-base ${
                    index % 2 === 0
                      ? "bg-white text-[#3B6CB5]"
                      : "bg-[#FFF0E9] text-[#C75F38]"
                  }`}
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="dp-enter dp-enter-delay-2 relative mx-auto min-h-[470px] w-full max-w-3xl sm:min-h-[620px]">
          <div
            className="absolute inset-x-[6%] bottom-[3%] h-[78%] rounded-[48%] bg-[#6B9FE8]/10"
            aria-hidden="true"
          />

          {preview.pages.map((page) => (
            <img
              key={page.src}
              src={page.src}
              alt={page.alt}
              className={page.className}
              loading="lazy"
              decoding="async"
            />
          ))}

          <div className="absolute bottom-[2%] left-1/2 z-[2] flex -translate-x-1/2 items-center gap-3 rounded-[18px] bg-white px-5 py-4 shadow-[0_18px_50px_rgba(60,88,128,0.18)]">
            <span className="grid h-10 w-10 place-items-center rounded-[12px] bg-[#EAF2FC] font-extrabold text-[#3B6CB5]">
              W
            </span>
            <span className="whitespace-nowrap text-base font-extrabold text-[#1F2937]">
              {preview.badge}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SessionPreview;
