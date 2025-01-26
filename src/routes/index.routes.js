import { jsx as _jsx } from "react/jsx-runtime";
import RouteProtector from "@/auth/RouteProtector";
import Areas from "@/pages/Areas";
import Competencias from "@/pages/Competencias";
export const routes = [
    {
        path: "/",
        element: (_jsx(RouteProtector, { children: _jsx(Areas, {}) })),
    },
    {
        path: "/competencias",
        element: (_jsx(RouteProtector, { children: _jsx(Competencias, {}) })),
    },
    // {
    //   path: "/callback",
    //   element: <Callback />,
    // },
];
