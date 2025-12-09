import { useEffect, useState } from "react";
import { useAuth0 } from "@/hooks/useAuth0";
import { obtenerHistorialPagos } from "@/services/pago.service";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, CreditCard, Loader2 } from "lucide-react";

interface Pago {
  id: string;
  mercadopagoId: string;
  estado: 'approved' | 'pending' | 'rejected' | 'cancelled';
  monto: number;
  moneda: string;
  descripcion: string;
  metodoPago: string;
  createdAt: string;
}

/**
 * Componente de historial de pagos (opcional - baja prioridad)
 * 
 * Uso:
 * <PaymentHistory />
 * 
 * O en una pestaña del perfil:
 * <Tabs>
 *   <TabPanel>Perfil</TabPanel>
 *   <TabPanel>Historial de Pagos</TabPanel>
 * </Tabs>
 */
export const PaymentHistory = () => {
  const { user } = useAuth0();
  const userId = (user as any)?.sub || null;

  const [pagos, setPagos] = useState<Pago[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const response = await obtenerHistorialPagos(userId);
        setPagos(response.data);
      } catch (err: any) {
        console.error('Error al cargar historial:', err);
        setError(err.message || 'Error al cargar historial de pagos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistorial();
  }, [userId]);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dp-success-100 text-dp-success-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Aprobado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dp-warning-100 text-dp-warning-700">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-dp-error-100 text-dp-error-700">
            <XCircle className="w-3 h-3 mr-1" />
            {estado === 'rejected' ? 'Rechazado' : 'Cancelado'}
          </span>
        );
      default:
        return null;
    }
  };

  const formatFecha = (fecha: string) => {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fecha;
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-dp-blue-500" />
          <span className="ml-3 text-dp-text-secondary">Cargando historial...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 border-dp-error-200">
        <div className="text-center py-8">
          <XCircle className="w-12 h-12 text-dp-error-500 mx-auto mb-3" />
          <p className="text-dp-text-secondary">{error}</p>
        </div>
      </Card>
    );
  }

  if (pagos.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <CreditCard className="w-12 h-12 text-dp-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-dp-text-title mb-2">
            Sin historial de pagos
          </h3>
          <p className="text-sm text-dp-text-secondary">
            Aún no has realizado ningún pago
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6 bg-dp-bg-secondary border-b border-dp-border-light">
        <h2 className="text-xl font-bold text-dp-text-title">Historial de Pagos</h2>
        <p className="text-sm text-dp-text-secondary mt-1">
          Todos tus pagos y transacciones
        </p>
      </div>

      <div className="divide-y divide-dp-border-light">
        {pagos.map((pago) => (
          <div key={pago.id} className="p-6 hover:bg-dp-bg-hover transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-dp-text-title">
                    {pago.descripcion}
                  </h3>
                  {getEstadoBadge(pago.estado)}
                </div>

                <div className="space-y-1 text-sm text-dp-text-secondary">
                  <p>
                    📅 {formatFecha(pago.createdAt)}
                  </p>
                  <p>
                    💳 {pago.metodoPago === 'credit_card' ? 'Tarjeta de Crédito' : 
                        pago.metodoPago === 'debit_card' ? 'Tarjeta de Débito' : 
                        pago.metodoPago}
                  </p>
                  <p className="text-xs text-dp-text-tertiary">
                    ID: {pago.mercadopagoId}
                  </p>
                </div>
              </div>

              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-dp-text-title">
                  {pago.moneda} {pago.monto.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
