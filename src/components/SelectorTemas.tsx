import { useState, useEffect } from "react";
import { getTemasPorCiclo, ITemaPorCiclo } from "@/services/temas.service";
import { getAllAreas } from "@/services/areas.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { BookOpen, Edit2, Plus, Check, X, Search } from "lucide-react";
import { handleToaster } from "@/utils/Toasters/handleToasters";
import { Skeleton } from "@/components/ui/skeleton";
import { useSesionStore } from "@/store/sesion.store";

interface SelectorTemasProps {
  onTemaSeleccionado?: (tema: string) => void;
}

function getTemaIdString(tema: ITemaPorCiclo): string | null {
  const id = (tema as any)?.id;
  if (id === null || id === undefined) return null;
  return String(id);
}

function normalizeTemaText(value: string): string {
  return value
    .replace(/^\s*\d+[\.\)\-:]\s*/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export function SelectorTemas({ onTemaSeleccionado }: SelectorTemasProps) {
  const { sesion, updateSesion } = useSesionStore();
  const [temas, setTemas] = useState<ITemaPorCiclo[]>([]);
  const [temasFiltrados, setTemasFiltrados] = useState<ITemaPorCiclo[]>([]);
  const [loading, setLoading] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [modoCrear, setModoCrear] = useState(false);
  const [temaSeleccionadoId, setTemaSeleccionadoId] = useState<string>("");
  const [temaEditado, setTemaEditado] = useState("");
  const [temaPersonalizado, setTemaPersonalizado] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // IDs de mapeo
  const GRADO_MAP: Record<string, number> = {
    "Primer Grado": 1,
    "Segundo Grado": 2,
    "Tercer Grado": 3,
    "Cuarto Grado": 4,
    "Quinto Grado": 5,
    "Sexto Grado": 6,
  };

  // Determinar ciclo basado en grado
  const getCicloIdPorGrado = (grado: string): number | undefined => {
    if (grado === "Primer Grado" || grado === "Segundo Grado") return 1;
    if (grado === "Tercer Grado" || grado === "Cuarto Grado") return 2;
    if (grado === "Quinto Grado" || grado === "Sexto Grado") return 3;
    return undefined;
  };

  // Cargar temas desde el backend (siempre que haya área; grado/ciclo opcionales si el perfil no es primaria)
  useEffect(() => {
    async function cargarTemas() {
      if (!sesion?.datosGenerales.area && sesion?.areaId == null) {
        return;
      }

      setLoading(true);
      try {
        // Obtener el ID del área
        const areasResponse = await getAllAreas();
        const areas = areasResponse.data.data || areasResponse.data;
        const areaEncontrada =
          areas.find((a: any) => a.nombre === sesion.datosGenerales.area) ??
          (sesion.areaId != null
            ? areas.find((a: any) => Number(a.id) === Number(sesion.areaId))
            : undefined);

        if (!areaEncontrada) {
          handleToaster("Área no encontrada", "error");
          return;
        }

        const gradoNombre = sesion.datosGenerales.grado?.trim() || "";
        const gradoIdFromNombre = gradoNombre ? GRADO_MAP[gradoNombre] : undefined;
        const gradoId = sesion.gradoId ?? gradoIdFromNombre;
        const cicloId = gradoNombre ? getCicloIdPorGrado(gradoNombre) : undefined;

        // Siempre llamar al catálogo: con área + grado si está disponible.
        // En primaria además enviamos ciclo cuando se puede mapear desde el nombre.
        const response = await getTemasPorCiclo({
          areaId: areaEncontrada.id,
          ...(gradoId ? { gradoId } : {}),
          ...(cicloId ? { cicloId } : {}),
        });

        const temasData = response.data.data || [];
        const seenTemas = new Set<string>();
        const temasUnicos = temasData.filter((tema) => {
          const key = normalizeTemaText(tema.tema || "");
          if (!key) return false;
          if (seenTemas.has(key)) return false;
          seenTemas.add(key);
          return true;
        });

        setTemas(temasUnicos);
        setTemasFiltrados(temasUnicos);

        // Si ya hay un tema en el store, seleccionarlo
        if (sesion.temaCurricular) {
          setTemaEditado(sesion.temaCurricular);
          const temaEncontrado = temasUnicos.find(t => t.tema === sesion.temaCurricular);
          if (temaEncontrado) {
            const temaId = getTemaIdString(temaEncontrado);
            if (temaId) setTemaSeleccionadoId(temaId);
          }
        }
      } catch (error) {
        handleToaster("Error al cargar temas del currículo", "error");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    cargarTemas();
  }, [sesion?.datosGenerales.area, sesion?.datosGenerales.grado, sesion?.areaId]);

  // Filtrar temas por búsqueda
  useEffect(() => {
    if (!busqueda.trim()) {
      setTemasFiltrados(temas);
    } else {
      const filtrados = temas.filter(tema =>
        tema.tema.toLowerCase().includes(busqueda.toLowerCase())
      );
      setTemasFiltrados(filtrados);
    }
  }, [busqueda, temas]);

  // Manejar selección de tema del select
  const handleSeleccionarTema = (temaId: string) => {
    setTemaSeleccionadoId(temaId);
    const temaEncontrado = temas.find(t => getTemaIdString(t) === temaId);
    
    if (temaEncontrado) {
      setTemaEditado(temaEncontrado.tema);
      setModoCrear(false);
      setTemaPersonalizado("");
      
      // Actualizar store con ID y texto del tema
      updateSesion({
        temaCurricular: temaEncontrado.tema,
        temaId: temaEncontrado.id, // 🆕 Guardar ID para el endpoint de IA
      });
      
      onTemaSeleccionado?.(temaEncontrado.tema);
    }
  };

  // Guardar tema editado (solo en store, no en BD)
  const handleGuardarEdicion = () => {
    if (!temaEditado.trim()) {
      handleToaster("El tema no puede estar vacío", "error");
      return;
    }

    // Si el texto fue modificado respecto al tema original, limpiar temaId
    // para que la IA use el texto en lugar del ID
    const temaOriginal = temas.find(t => getTemaIdString(t) === temaSeleccionadoId);
    const textoFueModificado = !temaOriginal || temaOriginal.tema !== temaEditado.trim();

    updateSesion({
      temaCurricular: temaEditado.trim(),
      ...(textoFueModificado && { temaId: undefined }),
    });

    onTemaSeleccionado?.(temaEditado.trim());
    setModoEdicion(false);
    handleToaster("Tema actualizado localmente", "success");
  };

  // Crear tema personalizado
  const handleCrearTemaPersonalizado = () => {
    if (!temaPersonalizado.trim()) {
      handleToaster("El tema personalizado no puede estar vacío", "error");
      return;
    }

    updateSesion({
      temaCurricular: temaPersonalizado.trim(),
      temaId: undefined, // No tiene ID porque es personalizado
    });

    onTemaSeleccionado?.(temaPersonalizado.trim());
    setTemaEditado(temaPersonalizado.trim());
    setModoCrear(false);
    setTemaSeleccionadoId("personalizado");
    handleToaster("Tema personalizado creado", "success");
  };

  // Cancelar edición
  const handleCancelarEdicion = () => {
    const temaOriginal = temas.find(t => getTemaIdString(t) === temaSeleccionadoId);
    if (temaOriginal) {
      setTemaEditado(temaOriginal.tema);
    }
    setModoEdicion(false);
  };

  // Activar modo crear tema
  const handleActivarModoCrear = () => {
    setModoCrear(true);
    setModoEdicion(false);
    setTemaSeleccionadoId("");
    setTemaPersonalizado("");
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Tema Curricular
        </CardTitle>
        <CardDescription>
          Selecciona un tema del currículo o crea uno personalizado. Este campo es obligatorio.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <>
            {/* Selector de temas */}
            {!modoCrear && (
              <div className="space-y-2">
                <Label htmlFor="tema-select">Selecciona un tema del currículo</Label>
                
                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tema..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select
                  value={temaSeleccionadoId}
                  onValueChange={handleSeleccionarTema}
                >
                  <SelectTrigger id="tema-select">
                    <SelectValue placeholder="Elige un tema..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {temasFiltrados.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        No se encontraron temas
                      </div>
                    ) : (
                      temasFiltrados
                        .map((tema) => ({ tema, id: getTemaIdString(tema) }))
                        .filter((x): x is { tema: ITemaPorCiclo; id: string } => !!x.id)
                        .map(({ tema, id }) => (
                          <SelectItem key={id} value={id}>
                            {tema.tema}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Vista de tema seleccionado con edición */}
            {temaSeleccionadoId && !modoCrear && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Tema seleccionado</Label>
                  {!modoEdicion && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setModoEdicion(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  )}
                </div>

                {modoEdicion ? (
                  <div className="space-y-2">
                    <Textarea
                      value={temaEditado}
                      onChange={(e) => setTemaEditado(e.target.value)}
                      rows={3}
                      placeholder="Edita el tema..."
                      className="resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleGuardarEdicion}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Guardar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelarEdicion}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm">{temaEditado}</p>
                  </div>
                )}
              </div>
            )}

            {/* Modo crear tema personalizado */}
            {modoCrear && (
              <div className="space-y-2">
                <Label htmlFor="tema-personalizado">Crear tema personalizado</Label>
                <Textarea
                  id="tema-personalizado"
                  value={temaPersonalizado}
                  onChange={(e) => setTemaPersonalizado(e.target.value)}
                  rows={3}
                  placeholder="Escribe tu tema personalizado..."
                  className="resize-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleCrearTemaPersonalizado}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Crear Tema
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setModoCrear(false)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Botón para activar modo crear */}
            {!modoCrear && (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleActivarModoCrear}
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear tema personalizado
              </Button>
            )}

            {/* Mensaje de advertencia si no hay tema */}
            {!sesion?.temaCurricular && !modoCrear && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ⚠️ Debes seleccionar o crear un tema para continuar
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
