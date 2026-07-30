const steps = [
  {
    number: "1",
    title: "Cuéntanos tu clase",
    description: "Elige el grado, el área y lo que quieres enseñar.",
    image: "/dashboard/sesion.png",
    imageAlt: "Cuaderno 3D para preparar una sesión de clase",
    imageClass: "scale-[1.08]",
    numberClass: "bg-[#EAF2FC] text-[#3B6CB5]",
  },
  {
    number: "2",
    title: "Recibe tu sesión lista",
    description: "Te armamos la sesión alineada al Currículo Nacional.",
    image: "/dashboard/unidad.png",
    imageAlt: "Organizador 3D de una unidad de aprendizaje",
    imageClass: "scale-[1.02]",
    numberClass: "bg-[#EAF8F3] text-[#397A68]",
  },
  {
    number: "3",
    title: "Descárgala y úsala",
    description: "En Word o PDF, lista para llevar a clase.",
    image: "/landing/lesson-documents-3d.png",
    imageAlt: "Sesión de aprendizaje disponible en Word y PDF",
    imageClass: "scale-[1.03]",
    numberClass: "bg-[#FFF0E9] text-[#C75F38]",
  },
];

function Features() {
  return (
    <section
      id="como-funciona"
      className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-24 lg:px-8 lg:pt-20"
    >
      <div className="mx-auto max-w-7xl">
        <div className="dp-enter dp-enter-delay-1 mb-10 max-w-2xl">
          <h2 className="text-balance text-4xl font-extrabold tracking-[-0.03em] text-[#1F2937] sm:text-5xl">
            De tu idea a una sesión completa
          </h2>
          <p className="mt-4 max-w-[42ch] text-xl font-semibold leading-8 text-[#6B7280]">
            Sigue tres pasos claros. Docente Pro organiza el resto por ti.
          </p>
        </div>

        <ol className="overflow-hidden rounded-[28px] bg-white shadow-[0_24px_70px_rgba(60,88,128,0.1)] ring-1 ring-[#E6EBF2] lg:grid lg:grid-cols-3">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={`dp-enter relative flex flex-col border-b border-[#E6EBF2] last:border-b-0 lg:min-h-[520px] lg:border-b-0 lg:border-r lg:last:border-r-0 ${
                index === 1
                  ? "dp-enter-delay-2"
                  : index === 2
                    ? "dp-enter-delay-3"
                    : "dp-enter-delay-1"
              }`}
            >
              <div className="relative h-72 overflow-hidden bg-white sm:h-80">
                <div
                  className={`absolute h-44 w-44 rounded-full blur-3xl ${
                    index === 0
                      ? "-left-10 top-12 bg-[#EAF2FC]"
                      : index === 1
                        ? "bottom-0 right-0 bg-[#EAF8F3]"
                        : "left-10 top-8 bg-[#FFF0E9]"
                  }`}
                  aria-hidden="true"
                />
                <img
                  src={step.image}
                  alt={step.imageAlt}
                  className={`relative h-full w-full object-contain p-1 ${step.imageClass}`}
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="relative min-w-0 flex-1 p-6 pt-4 sm:p-8 sm:pt-5">
                <span
                  className={`mb-5 grid h-14 w-14 place-items-center rounded-[18px] text-xl font-extrabold ${step.numberClass}`}
                  aria-hidden="true"
                >
                  {step.number}
                </span>
                <h3 className="text-2xl font-extrabold text-[#1F2937]">
                  {step.title}
                </h3>
                <p className="mt-2 text-lg font-semibold leading-7 text-[#6B7280]">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Features;
