import RouteProtector from "@/auth/RouteProtector";
import { PostLoginValidator } from "@/auth/PostLoginValidator";
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
      <RouteProtector>
        <OnboardingPage />
      </RouteProtector>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RouteProtector>
        <PostLoginValidator>
          
            <Dashboard />
        </PostLoginValidator>
      </RouteProtector>
    ),
  },
  {
    path: "/areas",
    element: (
      <RouteProtector>
        <Areas />
      </RouteProtector>
    ),
  },
  {
    path: "/crear-sesion",
    element: (
      <RouteProtector>
        <CuestionarioSesion />
      </RouteProtector>
    ),
  },
  {
    path: "/competencias",
    element: (
      <RouteProtector>
        <Competencias />
      </RouteProtector>
    ),
  },
  {
    path: "/cuestionario-inicial",
    element: (
      <RouteProtector>
        <CuestionarioInicial />
      </RouteProtector>
    ),
  },
  {
    path: "/planes",
    element: (
      <RouteProtector>
        <Planes />
      </RouteProtector>
    ),
  },
  {
    path: "/pago-exitoso",
    element: (
      <RouteProtector>
        <PagoExitoso />
      </RouteProtector>
    ),
  },
  {
    path: "/pago-fallido",
    element: (
      <RouteProtector>
        <PagoFallido />
      </RouteProtector>
    ),
  },
  {
    path: "/pago-pendiente",
    element: (
      <RouteProtector>
        <PagoPendiente />
      </RouteProtector>
    ),
  },
  {
    path: "/suscripcion-vencida",
    element: (
      <RouteProtector>
        <SuscripcionVencida />
      </RouteProtector>
    ),
  },
  {
    path: "/payment-success",
    element: (
      <RouteProtector>
        <PaymentSuccess />
      </RouteProtector>
    ),
  },
  {
    path: "/payment-failure",
    element: (
      <RouteProtector>
        <PaymentFailure />
      </RouteProtector>
    ),
  },
  {
    path: "/mis-sesiones",
    element: (
      <RouteProtector>
        <PostLoginValidator>
          <MisSesiones />
        </PostLoginValidator>
      </RouteProtector>
    ),
  },
  {
    path: "/evaluaciones",
    element: (
      <RouteProtector>
        <PostLoginValidator>
          <Evaluaciones />
        </PostLoginValidator>
      </RouteProtector>
    ),
  },
  {
    path: "/result",
    element: (
      <RouteProtector>
        <PostLoginValidator>
          <DocTest />
        </PostLoginValidator>
      </RouteProtector>
    ),
  },
  {
    path: "/graficos",
    element: <GraficosPlayground />,
  },

];
