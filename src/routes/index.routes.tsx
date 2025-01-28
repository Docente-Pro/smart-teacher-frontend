import RouteProtector from "@/auth/RouteProtector";
import UserValidation from "@/auth/UserValidation";
import Areas from "@/pages/Areas";
import Competencias from "@/pages/Competencias";
import CuestionarioInicial from "@/pages/CuestionarioInicial";

interface IRouteToCreate {
  path: string;
  element: JSX.Element;
}

export const routes: IRouteToCreate[] = [
  {
    path: "/",
    element: (
      <RouteProtector>
        <UserValidation>
          <Areas />
        </UserValidation>
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
    path: "cuestionario-inicial",
    element: (
      <RouteProtector>
        <CuestionarioInicial />
      </RouteProtector>
    ),
  },
];
