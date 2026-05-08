import { Navigate } from "react-router";
import { DevRoute } from "@/components/DevRoute";
import { lazy } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { GuestRoute } from "@/components/GuestRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/features/auth-screens/login/LoginPage";

const Areas = lazy(() => import("@/pages/Areas"));
const Competencias = lazy(() => import("@/pages/Competencias"));
const CuestionarioInicial = lazy(() => import("@/pages/CuestionarioInicial"));
const CuestionarioSesion = lazy(() => import("@/pages/CuestionarioSesion"));

interface IRouteToCreate {
  path: string;
  element: JSX.Element;
}

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const MisSesiones = lazy(() => import("@/pages/MisSesiones"));
const MisUnidades = lazy(() => import("@/pages/MisUnidades"));
const DocTest = lazy(() => import("@/pages/DocTest"));
const SesionViewer = lazy(() => import("@/pages/SesionViewer"));
const GraficosPlayground = lazy(() => import("@/pages/GraficosPlayground"));
const GraficosAreasPlayground = lazy(
  () => import("@/pages/GraficosAreasPlayground"),
);
const CrearUnidad = lazy(() => import("@/pages/CrearUnidad"));
const UnidadResult = lazy(() => import("@/pages/UnidadResult"));
const UnidadResultPrueba = lazy(() => import("@/pages/UnidadResultPrueba"));
const UnidadSuscriptorResult = lazy(
  () => import("@/pages/UnidadSuscriptorResult"),
);
const UnirseUnidad = lazy(() => import("@/pages/UnirseUnidad"));
const GenerarSesionPremium = lazy(() => import("@/pages/GenerarSesionPremium"));
const GenerarSesionSecundaria = lazy(
  () => import("@/pages/GenerarSesionSecundaria"),
);
const SesionPremiumResult = lazy(() => import("@/pages/SesionPremiumResult"));
const SesionSuscriptorResult = lazy(
  () => import("@/pages/SesionSuscriptorResult"),
);
const FichaAplicacionResult = lazy(
  () => import("@/pages/FichaAplicacionResult"),
);
const MisFichas = lazy(() => import("@/pages/MisFichas"));
const UnidadDetail = lazy(() => import("@/pages/UnidadDetail"));
const EditarSesionPremium = lazy(() => import("@/pages/EditarSesionPremium"));
const EditarUnidad = lazy(() => import("@/pages/EditarUnidad"));
const PagoExitoso = lazy(() => import("@/pages/PagoExitoso"));
const PagoFallido = lazy(() => import("@/pages/PagoFallido"));
const PagoPendiente = lazy(() => import("@/pages/PagoPendiente"));
const SuscripcionVencida = lazy(() => import("@/pages/SuscripcionVencida"));
const PaymentSuccess = lazy(() => import("@/pages/PaymentSuccess"));
const PaymentFailure = lazy(() => import("@/pages/PaymentFailure"));
const SignupPage = lazy(() => import("@/features/auth-screens/signup/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("@/features/auth-screens/forgot-password/ForgotPasswordPage"),
);
const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const DemoLoading = lazy(() => import("@/pages/DemoLoading"));

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
    path: "/unidad-result-prueba",
    element: (
      <ProtectedRoute>
        <UnidadResultPrueba />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unidad-prueba-result",
    element: (
      <ProtectedRoute>
        <UnidadResultPrueba />
      </ProtectedRoute>
    ),
  },
  {
    path: "/unidad-result-secundaria-prueba",
    element: (
      <ProtectedRoute>
        <UnidadResultPrueba />
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
    path: "/generar-sesion-secundaria",
    element: (
      <ProtectedRoute>
        <GenerarSesionSecundaria />
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
    element: <Navigate to="/dashboard" replace />,
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
