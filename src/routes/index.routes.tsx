import RouteProtector from "@/auth/RouteProtector";
import Areas from "@/pages/Areas";
import Competencias from "@/pages/Competencias";

interface IRouteToCreate {
  path: string;
  element: JSX.Element;
}

export const routes: IRouteToCreate[] = [
  {
    path: "/",
    element: (
      <RouteProtector>
        <Areas />
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
  // {
  //   path: "/callback",
  //   element: <Callback />,
  // },
];
