import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";
import Areas from "@/pages/Areas";
import Competencias from "@/pages/Competencias";
import CuestionarioInicial from "@/pages/CuestionarioInicial";
import CuestionarioSesion from "@/pages/CuestionarioSesion";
import LandingPage from "@/pages/LandingPage";
import Dashboard from "@/pages/Dashboard";
import Planes from "@/pages/Planes";
import PagoExitoso from "@/pages/PagoExitoso";
import PagoFallido from "@/pages/PagoFallido";
import PagoPendiente from "@/pages/PagoPendiente";
import SuscripcionVencida from "@/pages/SuscripcionVencida";
import PaymentSuccess from "@/pages/PaymentSuccess";
import PaymentFailure from "@/pages/PaymentFailure";
import LoginPage from "@/features/auth-screens/login/LoginPage";
import SignupPage from "@/features/auth-screens/signup/SignupPage";
import ForgotPasswordPage from "@/features/auth-screens/forgot-password/ForgotPasswordPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DemoLoading from "@/pages/DemoLoading";
import MisSesiones from "@/pages/MisSesiones";
import MisUnidades from "@/pages/MisUnidades";
import DocTest from "@/pages/DocTest";
import SesionViewer from "@/pages/SesionViewer";
import GraficosPlayground from "@/pages/GraficosPlayground";
import GraficosAreasPlayground from "@/pages/GraficosAreasPlayground";
import { DevRoute } from "@/components/DevRoute";
import CrearUnidad from "@/pages/CrearUnidad";
import UnidadResult from "@/pages/UnidadResult";
import UnidadSuscriptorResult from "@/pages/UnidadSuscriptorResult";
import UnirseUnidad from "@/pages/UnirseUnidad";
import GenerarSesionPremium from "@/pages/GenerarSesionPremium";
import SesionPremiumResult from "@/pages/SesionPremiumResult";
import SesionSuscriptorResult from "@/pages/SesionSuscriptorResult";
import FichaAplicacionResult from "@/pages/FichaAplicacionResult";
import MisFichas from "@/pages/MisFichas";
import UnidadDetail from "@/pages/UnidadDetail";
import EditarSesionPremium from "@/pages/EditarSesionPremium";
import EditarUnidad from "@/pages/EditarUnidad";

interface IRouteToCreate {
  path: string;
  element: JSX.Element;
}

export const routes: IRouteToCreate[] = [
  {
    path: "/",
    element: (
      <GuestRoute>
        <LandingPage />
      </GuestRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: "/signup",
    element: (
      <GuestRoute>
        <SignupPage />
      </GuestRoute>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <GuestRoute>
        <ForgotPasswordPage />
      </GuestRoute>
    ),
  },
  {
    path: "/demo-loading",
    element: <DemoLoading />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/areas",
    element: (
      <ProtectedRoute>
        <Areas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crear-unidad",
    element: (
      <ProtectedRoute>
        <CrearUnidad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unidad-result",
    element: (
      <ProtectedRoute>
        <UnidadResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unidad-suscriptor-result",
    element: (
      <ProtectedRoute>
        <UnidadSuscriptorResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sesion-suscriptor-result/:id",
    element: (
      <ProtectedRoute>
        <SesionSuscriptorResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unidad/:id",
    element: (
      <ProtectedRoute>
        <UnidadDetail />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unirse-unidad",
    element: (
      <ProtectedRoute>
        <UnirseUnidad />
      </ProtectedRoute>
    ),
  },
  {
    path: "/crear-sesion",
    element: (
      <ProtectedRoute>
        <CuestionarioSesion />
      </ProtectedRoute>
    ),
  },
  {
    path: "/generar-sesion",
    element: (
      <ProtectedRoute>
        <GenerarSesionPremium />
      </ProtectedRoute>
    ),
  },
  {
    path: "/competencias",
    element: (
      <ProtectedRoute>
        <Competencias />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cuestionario-inicial",
    element: (
      <ProtectedRoute>
        <CuestionarioInicial />
      </ProtectedRoute>
    ),
  },
  {
    path: "/planes",
    element: (
      <ProtectedRoute>
        <Planes />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pago-exitoso",
    element: (
      <ProtectedRoute>
        <PagoExitoso />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pago-fallido",
    element: (
      <ProtectedRoute>
        <PagoFallido />
      </ProtectedRoute>
    ),
  },
  {
    path: "/pago-pendiente",
    element: (
      <ProtectedRoute>
        <PagoPendiente />
      </ProtectedRoute>
    ),
  },
  {
    path: "/suscripcion-vencida",
    element: (
      <ProtectedRoute>
        <SuscripcionVencida />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-success",
    element: (
      <ProtectedRoute>
        <PaymentSuccess />
      </ProtectedRoute>
    ),
  },
  {
    path: "/payment-failure",
    element: (
      <ProtectedRoute>
        <PaymentFailure />
      </ProtectedRoute>
    ),
  },
  {
    path: "/mis-sesiones",
    element: (
      <ProtectedRoute>
        <MisSesiones />
      </ProtectedRoute>
    ),
  },
  {
    path: "/mis-unidades",
    element: (
      <ProtectedRoute>
        <MisUnidades />
      </ProtectedRoute>
    ),
  },
  {
    path: "/result",
    element: (
      <ProtectedRoute>
        <DocTest />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sesion-premium-result",
    element: (
      <ProtectedRoute>
        <SesionPremiumResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ficha-aplicacion-result",
    element: (
      <ProtectedRoute>
        <FichaAplicacionResult />
      </ProtectedRoute>
    ),
  },
  {
    path: "/mis-fichas",
    element: (
      <ProtectedRoute>
        <MisFichas />
      </ProtectedRoute>
    ),
  },
  {
    path: "/sesion/:id",
    element: (
      <ProtectedRoute>
        <SesionViewer />
      </ProtectedRoute>
    ),
  },
  {
    path: "/graficos",
    element: (
      <DevRoute>
        <GraficosPlayground />
      </DevRoute>
    ),
  },
  {
    path: "/graficos-areas",
    element: (
      <DevRoute>
        <GraficosAreasPlayground />
      </DevRoute>
    ),
  },
  {
    path: "/editar-sesion/:id",
    element: (
      <ProtectedRoute>
        <EditarSesionPremium />
      </ProtectedRoute>
    ),
  },
  {
    path: "/editar-unidad/:id",
    element: (
      <ProtectedRoute>
        <EditarUnidad />
      </ProtectedRoute>
    ),
  },

];
