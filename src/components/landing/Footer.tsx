import { Link } from "react-router";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-6 border-t border-[#E6EBF2] bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-base font-extrabold text-[#1F2937]">Docente Pro</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <Link
            to="/login"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#3B6CB5]"
          >
            Entrar
          </Link>
          <Link
            to="/privacidad"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#3B6CB5]"
          >
            Privacidad
          </Link>
          <Link
            to="/terminos"
            className="text-sm font-semibold text-[#6B7280] hover:text-[#3B6CB5]"
          >
            Términos
          </Link>
        </div>
        <p className="text-sm font-semibold text-[#9CA3AF]">
          © {currentYear}
        </p>
      </div>
    </footer>
  );
}

export default Footer;
