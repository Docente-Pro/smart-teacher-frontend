import Areas from "@/pages/Areas";
import Competencias from "@/pages/Competencias";

interface IRouteToCreate {
  path: string;
  element: JSX.Element;
}

export const routes: IRouteToCreate[] = [
  {
    path: "/",
    element: <Areas />,
  },
  {
    path: "/competencias",
    element: <Competencias />,
  },
];
