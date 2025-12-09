import { useAuth0 } from "@auth0/auth0-react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { useNavigate } from "react-router";

function Hero() {
  const { isAuthenticated } = useAuth0();

  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white py-20 px-4 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-25">
        <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-sky-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full border-2 border-white shadow-lg">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">Potenciado con Inteligencia Artificial</span>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
            Planifica tus sesiones de
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-100">aprendizaje con IA</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Genera sesiones, evaluaciones y rúbricas alineadas al <span className="font-semibold text-white">Currículo Nacional 2016</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-6 text-lg rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 border-2 border-white"
            >
              Comenzar Ahora
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-700 font-bold px-8 py-6 text-lg rounded-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 shadow-xl"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              Ver Planes
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 max-w-4xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-white shadow-xl hover:bg-white hover:shadow-2xl transition-all">
              <div className="text-4xl font-extrabold text-blue-700">+1000</div>
              <div className="text-blue-600 mt-2 font-medium">Sesiones generadas</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-white shadow-xl hover:bg-white hover:shadow-2xl transition-all">
              <div className="text-4xl font-extrabold text-blue-700">95%</div>
              <div className="text-blue-600 mt-2 font-medium">Ahorro de tiempo</div>
            </div>
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-white shadow-xl hover:bg-white hover:shadow-2xl transition-all">
              <div className="text-4xl font-extrabold text-blue-700">100%</div>
              <div className="text-blue-600 mt-2 font-medium">Alineado al CNEB</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
