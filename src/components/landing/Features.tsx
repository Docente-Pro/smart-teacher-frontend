const steps = [
  {
    number: "1",
    title: "Cuéntanos tu clase",
    description: "Elige el grado, el área y lo que quieres enseñar.",
    image: "/dashboard/sesion.png",
    imageAlt: "Cuaderno 3D para preparar una sesión de clase",
    imageClass: "scale-[1.08]",
    numberClass: "bg-[#EAF2FC] text-[#3B6CB5]",
    wellClass: "bg-[#EAF2FC]/45 lg:bg-white",
  },
  {
    number: "2",
    title: "Recibe tu sesión lista",
    description: "Te armamos la secuencia completa de la sesión.",
    image: "/dashboard/unidad.png",
    imageAlt: "Organizador 3D de una unidad de aprendizaje",
    imageClass: "scale-[1.02]",
    numberClass: "bg-[#EAF8F3] text-[#15803D]",
    wellClass: "bg-[#EAF8F3]/55 lg:bg-white",
  },
  {
    number: "3",
    title: "Descárgala y úsala",
    description: "Listo para editar o imprimir.",
    image: "/landing/lesson-documents-3d.png",
    imageAlt: "Sesión de aprendizaje disponible en Word y PDF",
    imageClass: "scale-[1.02]",
    numberClass: "bg-[#FFF0E9] text-[#C75F38]",
    wellClass: "bg-[#FFF0E9]/55 lg:bg-white",
  },
];

function Features() {
  return (
    <section
      id="como-funciona"
      className="relative scroll-mt-[5.5rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="dp-enter dp-enter-delay-1 mb-8 max-w-2xl sm:mb-9">
          <h2 className="text-balance text-3xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-4xl lg:text-[2.75rem]">
            De tu idea a una sesión completa
          </h2>
          <p className="mt-3 max-w-[42ch] text-lg font-semibold leading-7 text-[#6B7280] sm:text-xl sm:leading-8">
            Sigue tres pasos claros. Docente Pro organiza el resto por ti.
          </p>
        </div>

        <ol className="overflow-hidden rounded-[28px] bg-white shadow-[0_16px_48px_rgba(60,88,128,0.08)] ring-1 ring-[#E6EBF2] lg:grid lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={`dp-enter flex flex-row items-center gap-4 border-b border-[#E6EBF2] px-4 py-4 last:border-b-0 sm:gap-5 sm:px-5 sm:py-5 lg:flex-col lg:items-stretch lg:gap-0 lg:border-b-0 lg:border-r lg:p-0 lg:last:border-r-0 ${
                index === 1
                  ? "dp-enter-delay-2"
                  : index === 2
                    ? "dp-enter-delay-3"
                    : "dp-enter-delay-1"
              }`}
            >
              <div
                className={`relative h-[5.5rem] w-[5.75rem] shrink-0 overflow-hidden rounded-[18px] sm:h-28 sm:w-[6.5rem] lg:h-44 lg:w-full lg:rounded-none ${step.wellClass}`}
              >
                <img
                  src={step.image}
                  alt={step.imageAlt}
                  className={`relative h-full w-full object-contain p-1.5 lg:p-2 ${step.imageClass}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="min-w-0 flex-1 lg:px-5 lg:pb-6 lg:pt-4">
                <div className="flex items-start gap-3 lg:block">
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-[12px] text-sm font-extrabold lg:mb-3 lg:h-10 lg:w-10 lg:rounded-[14px] lg:text-base ${step.numberClass}`}
                    aria-hidden="true"
                  >
                    {step.number}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-extrabold leading-snug text-[#1F2937] sm:text-xl lg:mt-0 lg:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-5 text-[#6B7280] sm:text-base sm:leading-6 lg:mt-1.5 lg:text-lg lg:leading-7">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Features;
