import { Link } from "react-router";



function Footer() {

  const currentYear = new Date().getFullYear();

  const linkClass =

    "dp-press inline-flex min-h-11 items-center text-base font-semibold text-[#6B7280] hover:text-[#3B6CB5] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[rgba(255,139,92,0.32)]";



  return (

    <footer className="mt-6 border-t border-[#E6EBF2] bg-white px-4 py-10 sm:px-6 lg:px-8">

      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

        <p className="text-base font-extrabold text-[#1F2937]">Docente Pro</p>

        <div className="flex flex-wrap gap-x-5 gap-y-2">

          <Link to="/login" className={linkClass}>

            Entrar

          </Link>

          <Link to="/privacidad" className={linkClass}>

            Privacidad

          </Link>

          <Link to="/terminos" className={linkClass}>

            Términos

          </Link>

        </div>

        <p className="text-sm font-semibold text-[#9CA3AF]">© {currentYear}</p>

      </div>

    </footer>

  );

}



export default Footer;


