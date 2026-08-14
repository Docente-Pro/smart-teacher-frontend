import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertTriangle, Cpu, Image, Loader2, Zap } from "lucide-react";

import { getConsumoUsuario } from "@/services/admin.service";
import type { IConsumoUsuario } from "@/interfaces/IAdmin";
import {
  formatearNumero,
  formatearPen,
  formatearTokens,
  formatearUsd,
} from "@/utils/formatoCostos";

/** Paleta por coste: el modelo más caro primero, en rojo. */
const COLORES = ["#dc2626", "#ea580c", "#d97706", "#65a30d", "#0891b2", "#6366f1"];

/**
 * Consumo de IA de un docente, para el detalle de usuario del admin.
 *
 * Distingue siempre dos cosas que no se deben sumar a la ligera: el gasto
 * medido (telemetría real por tokens) y la estimación de lo generado antes de
 * que esa telemetría existiera.
 */
export function ConsumoIADocente({ usuarioId }: { usuarioId: string }) {
  const [datos, setDatos] = useState<IConsumoUsuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError(null);

    getConsumoUsuario(usuarioId)
      .then((res) => {
        if (vigente) setDatos(res.data);
      })
      .catch((e: any) => {
        if (vigente) {
          setError(e?.response?.data?.message || e?.message || "Error al cargar el consumo");
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [usuarioId]);

  if (cargando) {
    return (
      <div className="flex items-center gap-2 text-gray-500 text-sm py-6 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        Calculando consumo…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  if (!datos) return null;

  const sinTelemetria = datos.medido.llamadas === 0;
  const datosGrafica = datos.porModelo.slice(0, 6).map((m) => ({
    nombre: m.clave.replace(/^gemini-/, ""),
    usd: Number(m.usd.toFixed(6)),
    llamadas: m.llamadas,
  }));

  return (
    <div className="space-y-5">
      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Tarjeta
          etiqueta="Gasto medido"
          valor={formatearUsd(datos.medido.usd)}
          nota={formatearPen(datos.medido.pen)}
          icono={Zap}
          acento="text-blue-600"
        />
        <Tarjeta
          etiqueta="Este mes"
          valor={formatearUsd(datos.esteMes.usd)}
          nota={`${formatearNumero(datos.esteMes.llamadas)} llamadas`}
          icono={Cpu}
          acento="text-emerald-600"
        />
        <Tarjeta
          etiqueta="Estimado anterior"
          valor={formatearUsd(datos.estimadoPrevio.usd)}
          nota="antes de medir"
          icono={AlertTriangle}
          acento="text-amber-600"
        />
        <Tarjeta
          etiqueta="Total aproximado"
          valor={formatearUsd(datos.totalAproximadoUsd)}
          nota="medido + estimado"
          icono={Zap}
          acento="text-gray-900"
        />
      </div>

      {sinTelemetria && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Este docente todavía no tiene consumo medido. La cifra mostrada es una
          estimación a partir de {formatearNumero(datos.estimadoPrevio.volumen.sesiones)} sesiones,{" "}
          {formatearNumero(datos.estimadoPrevio.volumen.unidades)} unidades y{" "}
          {formatearNumero(datos.estimadoPrevio.volumen.fichas)} fichas
          {datos.estimadoPrevio.medias.origen === "referencia"
            ? ", usando costes de referencia."
            : ", usando el coste medio real de la plataforma."}
        </p>
      )}

      {/* Gasto por modelo */}
      {datosGrafica.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Gasto por modelo
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafica} layout="vertical" margin={{ left: 8, right: 16 }}>
                <XAxis type="number" tickFormatter={(v) => formatearUsd(v)} fontSize={11} />
                <YAxis type="category" dataKey="nombre" width={130} fontSize={11} />
                <Tooltip formatter={(valor) => formatearUsd(Number(valor))} />
                <Bar dataKey="usd" radius={[0, 4, 4, 0]}>
                  {datosGrafica.map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Detalle por operación */}
      {datos.porOperacion.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Gasto por operación
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-left">
                  <th className="py-2 pr-3 font-medium">Operación</th>
                  <th className="py-2 pr-3 font-medium text-right">Llamadas</th>
                  <th className="py-2 pr-3 font-medium text-right">Tokens</th>
                  <th className="py-2 font-medium text-right">Coste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {datos.porOperacion.slice(0, 12).map((o) => (
                  <tr key={o.clave} className="hover:bg-gray-50">
                    <td className="py-2 pr-3 font-mono text-xs text-gray-700">{o.clave}</td>
                    <td className="py-2 pr-3 text-right">{formatearNumero(o.llamadas)}</td>
                    <td className="py-2 pr-3 text-right text-gray-500">
                      {formatearTokens(o.tokensEntrada + o.tokensSalida)}
                    </td>
                    <td className="py-2 text-right font-medium">{formatearUsd(o.usd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Volumen e imágenes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <Mini etiqueta="Sesiones" valor={formatearNumero(datos.volumen.sesiones)} />
        <Mini etiqueta="Unidades" valor={formatearNumero(datos.volumen.unidades)} />
        <Mini etiqueta="Fichas" valor={formatearNumero(datos.volumen.fichas)} />
        <Mini
          etiqueta="Coste por imagen"
          valor={formatearUsd(datos.costesUnitarios.porImagen)}
          icono={Image}
        />
      </div>
    </div>
  );
}

function Tarjeta({
  etiqueta,
  valor,
  nota,
  icono: Icono,
  acento,
}: {
  etiqueta: string;
  valor: string;
  nota?: string;
  icono: React.ComponentType<{ className?: string }>;
  acento: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 mb-1">
        <Icono className={`w-4 h-4 ${acento}`} />
        <span className="text-gray-500 text-xs">{etiqueta}</span>
      </div>
      <p className={`text-lg font-bold ${acento}`}>{valor}</p>
      {nota && <p className="text-xs text-gray-400 mt-0.5">{nota}</p>}
    </div>
  );
}

function Mini({
  etiqueta,
  valor,
  icono: Icono,
}: {
  etiqueta: string;
  valor: string;
  icono?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
      <div className="flex items-center gap-1.5">
        {Icono && <Icono className="w-3.5 h-3.5 text-gray-400" />}
        <span className="text-gray-500 text-xs">{etiqueta}</span>
      </div>
      <p className="text-gray-900 font-semibold text-sm mt-0.5">{valor}</p>
    </div>
  );
}
