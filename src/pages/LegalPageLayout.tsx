import type { ReactNode } from "react";
import { Link } from "react-router";

interface LegalPageLayoutProps {
  title: string;
  children: ReactNode;
}

function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
  return (
    <div
      className="dp-canvas-dots min-h-[100dvh] px-4 py-10 text-[#1F2937] sm:px-6 lg:px-8"
      style={{ fontFamily: '"Nunito", system-ui, sans-serif' }}
    >
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="dp-press mb-8 inline-flex min-h-11 items-center text-base font-extrabold text-[#3B6CB5] underline decoration-[#6B9FE8]/50 underline-offset-4 hover:decoration-[#3B6CB5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]"
        >
          ← Volver al inicio
        </Link>
        <article className="rounded-[28px] border border-[#E6EBF2] bg-white p-8 shadow-[0_8px_28px_rgba(31,41,55,0.05)] sm:p-10">
          <h1 className="text-balance text-3xl font-extrabold tracking-[-0.02em] text-[#1F2937] sm:text-4xl">
            {title}
          </h1>
          <div className="prose-legal mt-8 space-y-5 text-base font-semibold leading-8 text-[#6B7280]">
            {children}
          </div>
        </article>
      </div>
    </div>
  );
}

export default LegalPageLayout;
