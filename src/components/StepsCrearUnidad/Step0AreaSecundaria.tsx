import { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  GraduationCap,
  Loader2,
  Lock,
} from "lucide-react";
import type { IUsuario } from "@/interfaces/IUsuario";
import { listarUnidadesByUsuario } from "@/services/unidad.service";
import { getAllAreas } from "@/services/areas.service";
import { getUsuarioMeGradosAreas, type IResumenUsuarioGradoArea } from "@/services/usuarios.service";
import { getAreaColor, getAreaIcon } from "@/constants/areaColors";
import {
  areasDocenteDesdePerfil,
  getAreaIdsConUnidadActivaPropietario,
} from "@/utils/unidadSecundaria";
import { useUnidadStore } from "@/store/unidad.store";

interface Props {
  usuario: IUsuario;
  userId: string;
  onBack: () => void;
}

/**
 * Solo Secundaria: elegir el área curricular de la nueva unidad.
 * - Siempre PERSONAL (no compartida).
 * - No puede elegir un área que ya tenga unidad activa como propietario (hasta finalizarla).
 */
function Step0AreaSecundaria({ usuario, userId, onBack }: Props) {
  const enterWizard = useUnidadStore((s) => s.enterWizardSecundariaPersonal);
  const [loading, setLoading] = useState(true);
  const [occupiedIds, setOccupiedIds] = useState<Set<number>>(new Set());
  const [nombresCatalogo, setNombresCatalogo] = useState<Record<number, string>>({});
  const [opciones, setOpciones] = useState<Array<{ areaId: number; nombre: string }>>([]);

  const opcionesDisplay = useMemo(() => {
    return opciones.map((o) => {
      const nombre =
        o.nombre.trim() ||
        nombresCatalogo[o.areaId] ||
        `Área (${o.areaId})`;
      return { areaId: o.areaId, nombre };
    });
  }, [opciones, nombresCatalogo]);

  useEffect(() => {
    let cancelled = false;
    getAllAreas()
      .then((res) => {
        const all = res.data.data || res.data || [];
        const map: Record<number, string> = {};
        for (const a of all) {
          if (a?.id != null && a?.nombre) {
            map[a.id] = a.nombre;
          }
        }
        if (!cancelled) setNombresCatalogo(map);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getUsuarioMeGradosAreas();
        const root = (res.data?.data ?? res.data ?? {}) as any;
        const resumen = Array.isArray(root?.resumenParaUnidad)
          ? (root.resumenParaUnidad as IResumenUsuarioGradoArea[])
          : [];
        const secundariaRows = resumen.filter((r) =>
          ((r?.nivelNombre || "").toLowerCase().includes("secundaria")),
        );
        const source = secundariaRows.length > 0 ? secundariaRows : resumen;
        const seen = new Set<number>();
        const parsed: Array<{ areaId: number; nombre: string }> = [];
        for (const row of source) {
          const areaId = Number(row?.areaId);
          if (!Number.isFinite(areaId) || seen.has(areaId)) continue;
          seen.add(areaId);
          parsed.push({ areaId, nombre: (row?.areaNombre || "").trim() });
        }
        if (!cancelled) {
          setOpciones(
            parsed.length > 0 ? parsed : areasDocenteDesdePerfil(usuario),
          );
        }
      } catch {
        if (!cancelled) setOpciones(areasDocenteDesdePerfil(usuario));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [usuario]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const list = await listarUnidadesByUsuario(userId);
        if (!cancelled) {
          setOccupiedIds(getAreaIdsConUnidadActivaPropietario(list, userId));
        }
      } catch {
        if (!cancelled) setOccupiedIds(new Set());
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-3xl space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Button>

        <Card className="border-2 border-cyan-200 dark:border-cyan-800 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/20">
                <GraduationCap className="h-7 w-7" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl text-white">
                  ¿Para qué área es esta unidad?
                </CardTitle>
                <CardDescription className="text-cyan-100 text-sm mt-1">
                  En secundaria cada unidad es personal y va ligada a un área. Podrás tener varias
                  unidades activas a la vez si son de áreas distintas.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 pb-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
                <p className="text-sm">Comprobando tus unidades activas…</p>
              </div>
            ) : opcionesDisplay.length === 0 ? (
              <p className="text-sm text-amber-700 dark:text-amber-300 text-center py-8">
                No encontramos áreas en tu perfil. Completa el onboarding o tu vínculo grado–área
                en secundaria y vuelve a intentar.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {opcionesDisplay.map(({ areaId, nombre }) => {
                  const bloqueada = occupiedIds.has(areaId);
                  const Icon = getAreaIcon(nombre);
                  const gradient = getAreaColor(nombre).gradient;
                  return (
                    <button
                      key={areaId}
                      type="button"
                      disabled={bloqueada}
                      onClick={() =>
                        enterWizard({
                          areaId,
                          nombre,
                        })
                      }
                      className={`
                        relative text-left rounded-2xl border-2 overflow-hidden transition-all
                        ${
                          bloqueada
                            ? "opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-700"
                            : "border-transparent hover:ring-4 hover:ring-cyan-400/50 hover:scale-[1.02] shadow-lg"
                        }
                      `}
                    >
                      <div className={`bg-gradient-to-br ${gradient} p-5 text-white`}>
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-white/20">
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-lg leading-tight">
                              {nombre.replace("Área de ", "")}
                            </p>
                            {bloqueada ? (
                              <p className="text-xs text-white/90 mt-2 flex items-center gap-1.5">
                                <Lock className="h-3.5 w-3.5 shrink-0" />
                                Ya tienes una unidad activa en esta área. Finalízala para crear otra.
                              </p>
                            ) : (
                              <p className="text-xs text-white/85 mt-2">
                                Crear unidad personal solo para esta área
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Step0AreaSecundaria;
