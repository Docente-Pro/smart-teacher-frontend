import { Zap, BarChart3, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

function Features() {
  const features = [
    {
      icon: Zap,
      title: "Sesiones en minutos",
      description: "Genera sesiones de aprendizaje completas alineadas al Currículo Nacional",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50 dark:bg-cyan-950",
    },
    {
      icon: BarChart3,
      title: "Evaluaciones automáticas",
      description: "Crea evaluaciones con rúbricas de manera automática",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: Clock,
      title: "Ahorra tiempo",
      description: "Dedica más tiempo a enseñar y menos a planificar",
      color: "text-sky-600",
      bgColor: "bg-sky-50 dark:bg-sky-950",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Todo lo que necesitas para planificar
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Herramientas diseñadas específicamente para docentes peruanos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-cyan-500 transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <CardHeader>
                  <div className={`w-16 h-16 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;
