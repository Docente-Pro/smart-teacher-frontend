import { Navigate } from "react-router";
import { AdminRoute } from "@/components/AdminRoute";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminPagosSuscripcion from "@/pages/admin/AdminPagosSuscripcion";
import AdminPagosUnidad from "@/pages/admin/AdminPagosUnidad";
import AdminUsuarios from "@/pages/admin/AdminUsuarios";
import AdminUsuarioDetalle from "@/pages/admin/AdminUsuarioDetalle";
import AdminRehacerPdf from "@/pages/admin/AdminRehacerPdf";
import AdminCorregirEstandaresPdf from "@/pages/admin/AdminCorregirEstandaresPdf";

interface IAdminRoute {
  path: string;
  element: JSX.Element;
  children?: {
    index?: boolean;
    path?: string;
    element: JSX.Element;
  }[];
}

export const adminRoutes: IAdminRoute[] = [
  {
    path: "/admin/login",
    element: <AdminLogin />,
  },
  {
    path: "/admin/rehacer-pdf/:sesionId",
    element: (
      <AdminRoute>
        <AdminRehacerPdf />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/corregir-estandares-pdf/:unidadId",
    element: (
      <AdminRoute>
        <AdminCorregirEstandaresPdf />
      </AdminRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <AdminDashboard />,
      },
      {
        path: "pagos-suscripcion",
        element: <AdminPagosSuscripcion />,
      },
      {
        path: "pagos-unidad",
        element: <AdminPagosUnidad />,
      },
      {
        path: "usuarios",
        element: <AdminUsuarios />,
      },
      {
        path: "usuarios/:id",
        element: <AdminUsuarioDetalle />,
      },
    ],
  },
];
