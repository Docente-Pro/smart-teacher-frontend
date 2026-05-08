import { Navigate } from "react-router";
import { lazy } from "react";
import { AdminRoute } from "@/components/AdminRoute";
import AdminLogin from "@/pages/admin/AdminLogin";

const AdminLayout = lazy(() => import("@/pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminPagosSuscripcion = lazy(() => import("@/pages/admin/AdminPagosSuscripcion"));
const AdminPagosUnidad = lazy(() => import("@/pages/admin/AdminPagosUnidad"));
const AdminUsuarios = lazy(() => import("@/pages/admin/AdminUsuarios"));
const AdminUsuarioDetalle = lazy(() => import("@/pages/admin/AdminUsuarioDetalle"));
const AdminRehacerPdf = lazy(() => import("@/pages/admin/AdminRehacerPdf"));
const AdminFichaPdf = lazy(() => import("@/pages/admin/AdminFichaPdf"));
const AdminCorregirEstandaresPdf = lazy(() => import("@/pages/admin/AdminCorregirEstandaresPdf"));

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
    path: "/admin/ficha-pdf/:sesionId",
    element: (
      <AdminRoute>
        <AdminFichaPdf />
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
