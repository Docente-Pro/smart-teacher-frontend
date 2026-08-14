import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Cpu,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getConsumoGlobal } from "@/services/admin.service";
import type { IConsumoGlobal, IConsumoRankingItem } from "@/interfaces/IAdmin";
import {
  formatearNumero,
  formatearPen,
  formatearTokens,
  formatearUsd,
} from "@/utils/formatoCostos";

const COLORES = ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#0891b2", "#6366f1", "#a855f7"];

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  sesion: "Sesiones",
  unidad: "Unidades",
  ficha: "Fichas",
  vision: "OCR y visión",
  otros: "Otros",
};

/** Rangos rápidos, en días hacia atrás. `null` = mes en curso (por defecto del backend). */
const RANGOS: { etiqueta: string; dias: number | null }[] = [
  { etiqueta: "Mes en curso", dias: null },
  { etiqueta: "7 días", dias: 7 },
  { etiqueta: "30 días", dias: 30 },
  { etiqueta: "90 días", dias: 90 },
];

export default function AdminConsumoIA() {
  const [datos, setDatos] = useState<IConsumoGlobal | null>(null);
  const [cargando, setCargando] = useState(true);
  const [rango, setRango] = useState<number | null>(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const params: { desde?: string; hasta?: string } = {};
      if (rango != null) {
        const desde = new Date();
        desde.setDate(desde.getDate() - rango);
        params.desde = desde.toISOString();
      }
      const res = await getConsumoGlobal(params);
      setDatos(res.data);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "No se pudo cargar el consumo de IA");
    } finally {
      setCargando(false);
    }
  }, [rango]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando && !datos) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Calculando consumo…
      </div>
    );
  }

  if (!datos) {
    return (
      <div className="text-center py-24 text-gray-500">
        No hay datos de consumo disponibles.
      </div>
    );
  }

  const sinDatos = datos.totales.llamadas === 0;
  const datosModelo = datos.porModelo.slice(0, 7).map((m) => ({
    nombre: m.clave.replace(/^gemini-/, ""),
    usd: Number(m.usd.toFixed(6)),
    llamadas: m.llamadas,
  }));
  const datosCategoria = Object.entries(datos.porCategoria)
    .map(([clave, v]) => ({ nombre: ETIQUETAS_CATEGORIA[clave] ?? clave, usd: Number(v.usd.toFixed(6)) }))
    .filter((c) => c.usd > 0)
    .sort((a, b) => b.usd - a.usd);
  const serie = datos.serieDiaria.map((d) => ({
    dia: new Date(d.dia).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
    usd: Number(d.usd.toFixed(6)),
    llamadas: d.llamadas,
  }));

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consumo de IA</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Gasto real en Gemini, medido por tokens.{" "}
            {new Date(datos.ventana.desde).toLocaleDateString("es-PE")} –{" "}
            {new Date(datos.ventana.hasta).toLocaleDateString("es-PE")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
            {RANGOS.map((r) => (
              <button
                key={r.etiqueta}
                onClick={() => setRango(r.dias)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  rango === r.dias
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {r.etiqueta}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={cargar} disabled={cargando}>
            {cargando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {sinDatos && (
        <div className="flex items-start gap-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Todavía no hay consumo medido en este rango.</p>
            <p className="text-amber-700 mt-0.5">
              La telemetría de costes registra cada llamada desde que se desplegó, así
              que los periodos anteriores aparecen vacíos. En el detalle de cada docente
              verás una estimación del gasto previo.
            </p>
          </div>
        </div>
      )}

      {/* Totales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tarjeta
          etiqueta="Gasto total"
          valor={formatearUsd(datos.totales.usd)}
          nota={formatearPen(datos.totales.pen)}
          icono={TrendingUp}
          color="bg-red-100 text-red-600 border-red-200"
        />
        <Tarjeta
          etiqueta="Llamadas"
          valor={formatearNumero(datos.totales.llamadas)}
          nota={`${formatearTokens(
            datos.totales.tokensEntrada + datos.totales.tokensSalida
          )} tokens`}
          icono={Cpu}
          color="bg-blue-100 text-blue-600 border-blue-200"
        />
        <Tarjeta
          etiqueta="Modelo que más gasta"
          valor={datos.modeloMasCaro?.clave.replace(/^gemini-/, "") ?? "—"}
          nota={datos.modeloMasCaro ? formatearUsd(datos.modeloMasCaro.usd) : undefined}
          icono={Cpu}
          color="bg-purple-100 text-purple-600 border-purple-200"
        />
        <Tarjeta
          etiqueta="Docentes con gasto"
          valor={formatearNumero(datos.docentesConGasto)}
          nota={`${formatearNumero(datos.volumen.sesiones)} sesiones`}
          icono={Users}
          color="bg-emerald-100 text-emerald-600 border-emerald-200"
        />
      </div>

      {/* Costes unitarios */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">Coste unitario</h2>
        <p className="text-xs text-gray-500 mb-4">
          Gasto de cada flujo dividido entre lo que se generó en el rango.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Unitario
            etiqueta="Por sesión"
            valor={formatearUsd(datos.costesUnitarios.porSesion)}
            detalle={`${formatearNumero(datos.volumen.sesiones)} sesiones`}
          />
          <Unitario
            etiqueta="Por unidad"
            valor={formatearUsd(datos.costesUnitarios.porUnidad)}
            detalle={`${formatearNumero(datos.volumen.unidades)} unidades`}
          />
          <Unitario
            etiqueta="Por ficha"
            valor={formatearUsd(datos.costesUnitarios.porFicha)}
            detalle={`${formatearNumero(datos.volumen.fichas)} fichas`}
          />
          <Unitario
            etiqueta="Por imagen"
            valor={formatearUsd(datos.costesUnitarios.porImagen)}
            detalle={`${formatearNumero(datos.volumen.imagenes)} imágenes`}
            icono={ImageIcon}
          />
        </div>
      </div>

      {/* Tendencia */}
      {serie.length > 1 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Gasto diario</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={serie} margin={{ left: 4, right: 8 }}>
                <defs>
                  <linearGradient id="gradienteGasto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dc2626" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#dc2626" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="dia" fontSize={11} />
                <YAxis tickFormatter={(v) => formatearUsd(v)} fontSize={11} width={70} />
                <Tooltip formatter={(v) => formatearUsd(Number(v))} />
                <Area
                  type="monotone"
                  dataKey="usd"
                  stroke="#dc2626"
                  strokeWidth={2}
                  fill="url(#gradienteGasto)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Modelo y categoría */}
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Gasto por modelo</h2>
          {datosModelo.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Sin datos</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={datosModelo} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <XAxis type="number" tickFormatter={(v) => formatearUsd(v)} fontSize={11} />
                  <YAxis type="category" dataKey="nombre" width={140} fontSize={11} />
                  <Tooltip formatter={(v) => formatearUsd(Number(v))} />
                  <Bar dataKey="usd" radius={[0, 4, 4, 0]}>
                    {datosModelo.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Gasto por tipo de flujo</h2>
          {datosCategoria.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Sin datos</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={datosCategoria}
                    dataKey="usd"
                    nameKey="nombre"
                    innerRadius={55}
                    outerRadius={95}
                    paddingAngle={2}
                    label={(d: any) => d.nombre}
                    fontSize={11}
                  >
                    {datosCategoria.map((_, i) => (
                      <Cell key={i} fill={COLORES[i % COLORES.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatearUsd(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Rankings */}
      <div className="grid lg:grid-cols-2 gap-4">
        <TablaRanking
          titulo="Quién consume más"
          icono={ArrowUp}
          acento="text-red-600"
          filas={datos.ranking}
        />
        <TablaRanking
          titulo="Quién consume menos"
          icono={ArrowDown}
          acento="text-emerald-600"
          filas={datos.rankingMenor}
        />
      </div>

      {/* Operaciones */}
      {datos.porOperacion.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-900">Gasto por operación</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Cada ruta del servicio de IA. Útil para ver qué paso concreto se lleva la factura.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="px-5 py-2 font-medium">Operación</th>
                  <th className="px-3 py-2 font-medium text-right">Llamadas</th>
                  <th className="px-3 py-2 font-medium text-right">Tokens</th>
                  <th className="px-3 py-2 font-medium text-right">Imagen</th>
                  <th className="px-5 py-2 font-medium text-right">Coste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datos.porOperacion.map((o) => (
                  <tr key={o.clave} className="hover:bg-gray-50">
                    <td className="px-5 py-2 font-mono text-xs text-gray-700">{o.clave}</td>
                    <td className="px-3 py-2 text-right">{formatearNumero(o.llamadas)}</td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {formatearTokens(o.tokensEntrada + o.tokensSalida)}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-500">
                      {o.tokensImagen > 0 ? formatearTokens(o.tokensImagen) : "—"}
                    </td>
                    <td className="px-5 py-2 text-right font-medium">{formatearUsd(o.usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Tarjeta({
  etiqueta,
  valor,
  nota,
  icono: Icono,
  color,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  icono: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className={`border rounded-xl px-4 py-3 ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icono className="w-4 h-4" />
        <span className="text-xs font-medium opacity-80">{etiqueta}</span>
      </div>
      <p className="text-xl font-bold truncate" title={valor}>
        {valor}
      </p>
      {nota && <p className="text-xs opacity-70 mt-0.5">{nota}</p>}
    </div>
  );
}

function Unitario({
  etiqueta,
  valor,
  detalle,
  icono: Icono,
}: {
  etiqueta: string;
  valor: string;
  detalle: string;
  icono?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        {Icono && <Icono className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-gray-500 text-xs">{etiqueta}</span>
      </div>
      <p className="text-gray-900 text-lg font-bold">{valor}</p>
      <p className="text-xs text-gray-400">{detalle}</p>
    </div>
  );
}

function TablaRanking({
  titulo,
  icono: Icono,
  acento,
  filas,
}: {
  titulo: string;
  icono: React.ComponentType<{ className?: string }>;
  acento: string;
  filas: IConsumoRankingItem[];
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2">
        <Icono className={`w-4 h-4 ${acento}`} />
        <h2 className="text-sm font-semibold text-gray-900">{titulo}</h2>
      </div>
      {filas.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Sin datos</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-left">
                <th className="px-5 py-2 font-medium">Docente</th>
                <th className="px-3 py-2 font-medium text-right">Llamadas</th>
                <th className="px-5 py-2 font-medium text-right">Coste</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filas.map((f) => (
                <tr key={f.usuarioId} className="hover:bg-gray-50">
                  <td className="px-5 py-2">
                    <Link
                      to={`/admin/usuarios/${f.usuarioId}`}
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      {f.nombre}
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                    <p className="text-xs text-gray-400">
                      {f.nombreInstitucion || f.email || "—"}
                    </p>
                  </td>
                  <td className="px-3 py-2 text-right">{formatearNumero(f.llamadas)}</td>
                  <td className="px-5 py-2 text-right font-medium">{formatearUsd(f.usd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
