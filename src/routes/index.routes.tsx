import { ProtectedRoute } from "@/components/ProtectedRoute";
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
import OnboardingPage from "@/pages/OnboardingPage";
import DemoLoading from "@/pages/DemoLoading";
import MisSesiones from "@/pages/MisSesiones";
import Evaluaciones from "@/pages/Evaluaciones";
import DocTest from "@/pages/DocTest";
import GraficosPlayground from "@/pages/GraficosPlayground";

interface IRouteToCreate {
  path: string;
  element: JSX.Element;
}

export const routes: IRouteToCreate[] = [
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignupPage />,
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
    path: "/crear-sesion",
    element: (
      <ProtectedRoute>
        <CuestionarioSesion />
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
    path: "/evaluaciones",
    element: (
      <ProtectedRoute>
        <Evaluaciones />
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
    path: "/graficos",
    element: <GraficosPlayground />,
  },

];
