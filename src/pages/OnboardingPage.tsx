import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Building2, GraduationCap, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { INivel } from "@/interfaces/INivel";
import { IGrado } from "@/interfaces/IGrado";
import { getNiveles } from "@/features/initialForm/services/niveles.service";
import { getAllGrados } from "@/services/grado.service";
import { instance } from "@/services/instance";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { GlobalLoading } from "@/components/GlobalLoading";
import { useAuth0 } from "@/hooks/useAuth0";
import { useAuthStore } from "@/store/auth.store";

interface OnboardingData {
  nombreInstitucion: string;
  nivelId: number;
  gradoId: number;
}

function OnboardingPage() {
  const { user, isLoading: authLoading } = useAuth0();
  const { updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();

  const [formData, setFormData] = useState<OnboardingData>({
    nombreInstitucion: "",
    nivelId: 0,
    gradoId: 0,
  });
  const [niveles, setNiveles] = useState<INivel[]>([]);
  const [todosLosGrados, setTodosLosGrados] = useState<IGrado[]>([]);
  const [gradosFiltrados, setGradosFiltrados] = useState<IGrado[]>([]);

  // Verificar si ya completó el onboarding
  useEffect(() => {
    if (user?.perfilCompleto) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  console.log(user);
  

  // Cargar niveles y grados
  useEffect(() => {
    async function loadData() {
      try {
        const [nivelesResponse, gradosResponse] = await Promise.all([getNiveles(), getAllGrados()]);

        setNiveles(nivelesResponse.data.data);
        setTodosLosGrados(gradosResponse.data.data);
      } catch (error) {
        handleToaster("Error al cargar datos", "error");
      }
    }

    loadData();
  }, []);

  // Filtrar grados cuando cambia el nivel
  useEffect(() => {
    if (formData.nivelId && todosLosGrados.length > 0) {
      const gradosDelNivel = todosLosGrados.filter((grado) => grado.nivelId === formData.nivelId);
      setGradosFiltrados(gradosDelNivel);

      // Limpiar grado si no pertenece al nivel seleccionado
      if (formData.gradoId) {
        const gradoValido = gradosDelNivel.find((g) => g.id === formData.gradoId);
        if (!gradoValido) {
          setFormData((prev) => ({ ...prev, gradoId: 0 }));
        }
      }
    } else {
      setGradosFiltrados([]);
    }
  }, [formData.nivelId, formData.gradoId, todosLosGrados]);

  function validateForm(): boolean {
    if (!formData.nombreInstitucion || formData.nombreInstitucion.trim().length < 3) {
      return false;
    }

    if (!formData.nivelId || formData.nivelId === 0) {
      return false;
    }

    if (!formData.gradoId || formData.gradoId === 0) {
      return false;
    }

    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateForm()) {
      handleToaster("Por favor, completa todos los campos", "error");
      return;
    }

    if (!user?.id) {
      handleToaster("Error: No se encontró el ID del usuario", "error");
      return;
    }

    showLoading("Guardando tu perfil...");

    try {
      const response = await instance.patch(`/usuario/${user.id}`, {
        nombreInstitucion: formData.nombreInstitucion,
        nivelId: formData.nivelId,
        gradoId: formData.gradoId,
      });

      // ✅ Actualizar el store con los datos nuevos del usuario
      const usuarioActualizado = response.data.data || response.data;
      updateUser({
        perfilCompleto: true,
        // Actualizar otros campos si el backend los devuelve
        ...(usuarioActualizado.nombreInstitucion && { name: usuarioActualizado.nombre }),
      });

      handleToaster("¡Perfil completado exitosamente!", "success");

      // Mantener loading mientras redirige
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      hideLoading();
      handleToaster("Error al actualizar perfil. Intenta nuevamente.", "error");
    }
  }

  if (authLoading) {
    return <GlobalLoading message="Cargando perfil..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-25">
        <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-sky-400 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-2xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-8 md:p-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">¡Bienvenido, {user?.name}! 🎉</h1>
          <p className="text-gray-600 dark:text-gray-400">Completa tu perfil para personalizar tu experiencia en DocentePro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Institución Educativa */}
          <div className="space-y-2">
            <Label htmlFor="institucion" className="text-gray-700 dark:text-gray-300 text-base">
              Institución Educativa
            </Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                id="institucion"
                type="text"
                placeholder="I.E. María Parado de Bellido"
                className="pl-10 py-6 text-base"
                value={formData.nombreInstitucion}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombreInstitucion: e.target.value }))}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Este nombre aparecerá en tus documentos generados</p>
          </div>

          {/* Nivel Educativo */}
          <div className="space-y-2">
            <Label htmlFor="nivel" className="text-gray-700 dark:text-gray-300 text-base">
              Nivel Educativo
            </Label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Select
                value={formData.nivelId ? formData.nivelId.toString() : ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, nivelId: parseInt(value) }))}
              >
                <SelectTrigger className="pl-10 py-6">
                  <SelectValue placeholder="Selecciona un nivel" />
                </SelectTrigger>
                <SelectContent>
                  {niveles.map((nivel) => (
                    <SelectItem key={nivel.id} value={nivel.id.toString()}>
                      {nivel.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Grado */}
          <div className="space-y-2">
            <Label htmlFor="grado" className="text-gray-700 dark:text-gray-300 text-base">
              Grado
            </Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <Select
                value={formData.gradoId ? formData.gradoId.toString() : ""}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, gradoId: parseInt(value) }))}
                disabled={!formData.nivelId}
              >
                <SelectTrigger className="pl-10 py-6">
                  <SelectValue placeholder={formData.nivelId ? "Selecciona un grado" : "Primero selecciona un nivel"} />
                </SelectTrigger>
                <SelectContent>
                  {gradosFiltrados.map((grado) => (
                    <SelectItem key={grado.id} value={grado.id.toString()}>
                      {grado.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-semibold mt-8"
          >
            Completar Perfil
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;
