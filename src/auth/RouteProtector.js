import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
function RouteProtector({ children }) {
    const { isAuthenticated, isLoading, loginWithRedirect, getIdTokenClaims, logout } = useAuth0();
    const [hasRole, setHasRole] = useState(false);
    console.log(hasRole);
    useEffect(() => {
        const checkUserRole = async () => {
            const claims = await getIdTokenClaims();
            console.log('Claims:', claims); // Agrega este console.log para inspeccionar los claims
            if (claims) {
                const roles = claims["https://smart-teacher.com/roles"] || []; // Usa el mismo namespace aquí
                setHasRole(roles.includes("Subscriber"));
            }
        };
        if (isAuthenticated) {
            checkUserRole();
        }
    }, [isAuthenticated, getIdTokenClaims]);
    if (isLoading) {
        return _jsx("div", { children: "Loading..." });
    }
    if (!isAuthenticated) {
        loginWithRedirect();
        return _jsx("div", { children: "Redirecting..." });
    }
    if (!hasRole) {
        return (_jsxs("div", { className: "flex flex-col items-center justify-center h-screen gap-4", children: ["Access Denied", _jsx("button", { onClick: () => logout(), className: "bg-red-500 text-white p-4 rounded-2xl", children: "Logout" })] }));
    }
    return children;
}
export default RouteProtector;
