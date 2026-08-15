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

import { adminCard } from "@/styles/adminUi";

/** Paleta por coste: atmosphere, peach, warning, verde. Sin purple. */
const COLORES = ["#C2410C", "#FF8B5C", "#3B6CB5", "#6B9FE8", "#15803D", "#6B7280"];

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
      <div className="flex items-center justify-center gap-2 py-6 text-base font-semibold text-[#6B7280]">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Calculando consumo…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-2 rounded-[16px] border border-[#E6EBF2] bg-[#FFF7ED] p-3 text-base font-semibold text-[#C2410C]">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
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
          acento="text-[#3B6CB5]"
        />
        <Tarjeta
          etiqueta="Este mes"
          valor={formatearUsd(datos.esteMes.usd)}
          nota={`${formatearNumero(datos.esteMes.llamadas)} llamadas`}
          icono={Cpu}
          acento="text-[#15803D]"
        />
        <Tarjeta
          etiqueta="Estimado anterior"
          valor={formatearUsd(datos.estimadoPrevio.usd)}
          nota="antes de medir"
          icono={AlertTriangle}
          acento="text-[#C2410C]"
        />
        <Tarjeta
          etiqueta="Total aproximado"
          valor={formatearUsd(datos.totalAproximadoUsd)}
          nota="medido + estimado"
          icono={Zap}
          acento="text-[#1F2937]"
        />
      </div>

      {sinTelemetria && (
        <p className="rounded-[16px] bg-[#FFF7ED] px-3 py-2 text-sm font-semibold text-[#C2410C]">
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
          <h3 className="mb-2 text-sm font-bold text-[#6B7280]">
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
          <h3 className="mb-2 text-sm font-bold text-[#6B7280]">
            Gasto por operación
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E6EBF2] text-left text-sm font-bold text-[#6B7280]">
                  <th className="py-2 pr-3 font-medium">Operación</th>
                  <th className="py-2 pr-3 font-medium text-right">Llamadas</th>
                  <th className="py-2 pr-3 font-medium text-right">Tokens</th>
                  <th className="py-2 font-medium text-right">Coste</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E6EBF2]">
                {datos.porOperacion.slice(0, 12).map((o) => (
                  <tr key={o.clave} className="hover:bg-[#F5F7FA]">
                    <td className="py-2 pr-3 font-mono text-sm text-[#1F2937]">{o.clave}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{formatearNumero(o.llamadas)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-[#6B7280]">
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
    <div className={`${adminCard} px-4 py-3`}>
      <div className="mb-1 flex items-center gap-2">
        <Icono className={`h-4 w-4 ${acento}`} />
        <span className="text-sm font-bold text-[#6B7280]">{etiqueta}</span>
      </div>
      <p className={`text-lg font-extrabold tabular-nums ${acento}`}>{valor}</p>
      {nota && <p className="mt-0.5 text-sm font-semibold text-[#9CA3AF]">{nota}</p>}
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
    <div className="rounded-[16px] border border-[#E6EBF2] bg-[#F5F7FA] px-3 py-2">
      <div className="flex items-center gap-1.5">
        {Icono && <Icono className="h-3.5 w-3.5 text-[#6B7280]" />}
        <span className="text-sm font-bold text-[#6B7280]">{etiqueta}</span>
      </div>
      <p className="mt-0.5 text-base font-extrabold tabular-nums text-[#1F2937]">{valor}</p>
    </div>
  );
}
