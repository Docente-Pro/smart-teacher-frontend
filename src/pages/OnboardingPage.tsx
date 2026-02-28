import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { Building2, GraduationCap, MapPin, User } from "lucide-react";
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
import { useAuth0 } from "@auth0/auth0-react";
import { useAuthStore } from "@/store/auth.store";

// ── Ubigeo data ──
import departamentosData from "@/utils/peru_ubigeo/1_ubigeo_departamentos.json";
import provinciasData from "@/utils/peru_ubigeo/2_ubigeo_provincias.json";
import distritosData from "@/utils/peru_ubigeo/3_ubigeo_distritos.json";

interface UbigeoDepartamento {
  id: number;
  departamento: string;
  ubigeo: string;
}
interface UbigeoProvincia {
  id: number;
  provincia: string;
  ubigeo: string;
  departamento_id: number;
}
interface UbigeoDistrito {
  id: number;
  distrito: string;
  ubigeo: string;
  provincia_id: number;
  departamento_id: number;
}

const departamentos: UbigeoDepartamento[] = departamentosData.ubigeo_departamentos;
const provincias: UbigeoProvincia[] = provinciasData.ubigeo_provincias;
const distritos: UbigeoDistrito[] = distritosData.ubigeo_distritos;

interface OnboardingData {
  nombre: string;
  nombreInstitucion: string;
  genero: string;
  nivelId: number;
  gradoId: number;
  departamento: string;
  provincia: string;
  distrito: string;
}

function OnboardingPage() {
  const { user: auth0User, isLoading: authLoading } = useAuth0();
  const { user: backendUser, updateUser } = useAuthStore(); // Usar usuario del backend
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useGlobalLoading();

  const [formData, setFormData] = useState<OnboardingData>({
    nombre: "",
    nombreInstitucion: "",
    genero: "",
    nivelId: 0,
    gradoId: 0,
    departamento: "",
    provincia: "",
    distrito: "",
  });
  const [niveles, setNiveles] = useState<INivel[]>([]);
  const [todosLosGrados, setTodosLosGrados] = useState<IGrado[]>([]);
  const [gradosFiltrados, setGradosFiltrados] = useState<IGrado[]>([]);

  // ── Filtrar provincias y distritos en cascada ──
  const provinciasFiltradas = useMemo(() => {
    if (!formData.departamento) return [];
    const dep = departamentos.find((d) => d.departamento === formData.departamento);
    if (!dep) return [];
    return provincias.filter((p) => p.departamento_id === dep.id);
  }, [formData.departamento]);

  const distritosFiltrados = useMemo(() => {
    if (!formData.provincia) return [];
    const prov = provincias.find(
      (p) => p.provincia === formData.provincia && provinciasFiltradas.includes(p)
    );
    if (!prov) return [];
    return distritos.filter((d) => d.provincia_id === prov.id);
  }, [formData.provincia, provinciasFiltradas]);

  // Verificar si ya completó el onboarding
  useEffect(() => {
    if (backendUser?.perfilCompleto) {
      navigate("/dashboard");
    }
  }, [backendUser, navigate]);

  // Debug solo en desarrollo, dentro de useEffect para no loguear en cada render
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('Usuario Auth0:', auth0User);
      console.log('Usuario Backend:', backendUser);
    }
  }, [auth0User?.sub, backendUser?.id]);

  // Cargar niveles y grados
  useEffect(() => {
    async function loadData() {
      try {
        const [nivelesResponse, gradosResponse] = await Promise.all([getNiveles(), getAllGrados()]);

        setNiveles(
          nivelesResponse.data.data.filter(
            (nivel: INivel) => !nivel.nombre?.toLowerCase().includes("secundaria")
          )
        );
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
      const gradosDelNivel = todosLosGrados.filter((grado) => grado.nivelId === formData.nivelId).sort((a, b) => a.id - b.id); // Ordenar por ID ascendente

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
    if (!formData.nombre || formData.nombre.trim().length < 2) {
      return false;
    }

    if (!formData.nombreInstitucion || formData.nombreInstitucion.trim().length < 3) {
      return false;
    }

    if (!formData.genero) {
      return false;
    }

    if (!formData.nivelId || formData.nivelId === 0) {
      return false;
    }

    if (!formData.gradoId || formData.gradoId === 0) {
      return false;
    }

    if (!formData.departamento) {
      return false;
    }

    if (!formData.provincia) {
      return false;
    }

    if (!formData.distrito) {
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

    if (!backendUser?.id) {
      handleToaster("Error: No se encontró el ID del usuario", "error");
      console.error('No hay usuario en el store:', backendUser);
      return;
    }

    showLoading("Guardando tu perfil...");

    try {
      const response = await instance.patch(`/usuario/${backendUser.id}`, {
        nombre: formData.nombre,
        nombreInstitucion: formData.nombreInstitucion,
        genero: formData.genero,
        nivelId: formData.nivelId,
        gradoId: formData.gradoId,
        departamento: formData.departamento,
        provincia: formData.provincia,
        distrito: formData.distrito,
      });

      // ✅ Actualizar el store con los datos nuevos del usuario
      const usuarioActualizado = response.data.data || response.data;
      updateUser({
        perfilCompleto: true,
        nombreInstitucion: formData.nombreInstitucion,
        nivelId: formData.nivelId,
        gradoId: formData.gradoId,
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-25">
        <div className="absolute top-10 -left-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 -right-20 w-[500px] h-[500px] bg-sky-400 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-3xl bg-white dark:bg-gray-950 rounded-2xl shadow-2xl p-5 sm:p-8 md:p-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">¡Bienvenido, {auth0User?.name}! 🎉</h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">Completa tu perfil para personalizar tu experiencia en DocentePro</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">

          {/* ── Sección: Datos personales ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Datos personales</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="nombre" className="text-gray-700 dark:text-gray-300 text-sm">
                  Nombre completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    className="pl-10 py-5 text-sm"
                    value={formData.nombre}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="institucion" className="text-gray-700 dark:text-gray-300 text-sm">
                  Institución Educativa
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="institucion"
                    type="text"
                    placeholder="I.E. María Parado de Bellido"
                    className="pl-10 py-5 text-sm"
                    value={formData.nombreInstitucion}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nombreInstitucion: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">El nombre de la institución aparecerá en tus documentos generados.</p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* ── Sección: Información académica ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Información académica</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Género */}
              <div className="space-y-1.5">
                <Label htmlFor="genero" className="text-gray-700 dark:text-gray-300 text-sm">
                  Género
                </Label>
                <Select
                  value={formData.genero}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, genero: value }))}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Femenino">Femenino</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-400 dark:text-gray-500">Para personalizar: "el/la docente"</p>
              </div>

              {/* Nivel Educativo */}
              <div className="space-y-1.5">
                <Label htmlFor="nivel" className="text-gray-700 dark:text-gray-300 text-sm">
                  Nivel Educativo
                </Label>
                <Select
                  value={formData.nivelId ? formData.nivelId.toString() : ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, nivelId: parseInt(value) }))}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Selecciona" />
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

              {/* Grado */}
              <div className="space-y-1.5">
                <Label htmlFor="grado" className="text-gray-700 dark:text-gray-300 text-sm">
                  Grado
                </Label>
                <Select
                  value={formData.gradoId ? formData.gradoId.toString() : ""}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, gradoId: parseInt(value) }))}
                  disabled={!formData.nivelId}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder={formData.nivelId ? "Selecciona" : "Elige nivel primero"} />
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
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* ── Sección: Ubicación ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Ubicación geográfica</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="departamento" className="text-gray-700 dark:text-gray-300 text-sm">
                  Departamento
                </Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, departamento: value, provincia: "", distrito: "" }))
                  }
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    {departamentos.map((dep) => (
                      <SelectItem key={dep.id} value={dep.departamento}>
                        {dep.departamento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="provincia" className="text-gray-700 dark:text-gray-300 text-sm">
                  Provincia
                </Label>
                <Select
                  value={formData.provincia}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, provincia: value, distrito: "" }))
                  }
                  disabled={!formData.departamento}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder={formData.departamento ? "Selecciona" : "Elige depto."} />
                  </SelectTrigger>
                  <SelectContent>
                    {provinciasFiltradas.map((prov) => (
                      <SelectItem key={prov.id} value={prov.provincia}>
                        {prov.provincia}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="distrito" className="text-gray-700 dark:text-gray-300 text-sm">
                  Distrito
                </Label>
                <Select
                  value={formData.distrito}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, distrito: value }))
                  }
                  disabled={!formData.provincia}
                >
                  <SelectTrigger className="py-5">
                    <SelectValue placeholder={formData.provincia ? "Selecciona" : "Elige prov."} />
                  </SelectTrigger>
                  <SelectContent>
                    {distritosFiltrados.map((dist) => (
                      <SelectItem key={dist.id} value={dist.distrito}>
                        {dist.distrito}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-6 text-base font-semibold mt-4 rounded-xl transition-all duration-200 hover:shadow-lg"
          >
            Completar Perfil
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;
