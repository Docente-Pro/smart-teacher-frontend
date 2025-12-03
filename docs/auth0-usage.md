# Guía de Uso de Auth0 en Docente Pro Frontend

## 📚 Índice
- [Introducción](#introducción)
- [Configuración](#configuración)
- [Hook useAuth0](#hook-useauth0)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Casos de Uso Comunes](#casos-de-uso-comunes)
- [Protección de Rutas](#protección-de-rutas)
- [Mejores Prácticas](#mejores-prácticas)

## Introducción

Este proyecto utiliza el SDK oficial de Auth0 para React (`@auth0/auth0-react`) para manejar la autenticación de usuarios. Auth0 proporciona autenticación segura mediante OAuth 2.0 y OpenID Connect.

## Configuración

### Variables de Entorno

El proyecto usa las siguientes variables de entorno (configuradas en `.env.local`):

```env
VITE_AUTH0_DOMAIN=dev-uaweb6dupy6goyur.us.auth0.com
VITE_AUTH0_CLIENT_ID=nfKGnqiJ7isXoUXKbouhhjAQqXurJrem
VITE_AUTH0_AUDIENCE=
```

### Provider

El `Auth0Provider` ya está configurado en `src/main.tsx`:

```tsx
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  authorizationParams={{
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    scope: "openid profile email",
  }}
>
  {/* Tu aplicación */}
</Auth0Provider>
```

## Hook useAuth0

El hook `useAuth0()` proporciona acceso a todo el estado y métodos de autenticación.

### Propiedades Principales

```tsx
const {
  // Estado
  isLoading,        // boolean: true mientras se verifica la autenticación
  isAuthenticated,  // boolean: true si el usuario está autenticado
  error,            // Error | undefined: errores de autenticación
  user,             // User | undefined: información del usuario autenticado
  
  // Métodos
  loginWithRedirect,      // Función para iniciar sesión
  loginWithPopup,         // Función para iniciar sesión con popup
  logout,                 // Función para cerrar sesión
  getAccessTokenSilently, // Función para obtener tokens de acceso
  getIdTokenClaims,       // Función para obtener claims del ID token
} = useAuth0();
```

### Tipos de Usuario

El objeto `user` contiene información del perfil del usuario:

```typescript
interface User {
  sub: string;              // ID único del usuario
  name?: string;            // Nombre completo
  email?: string;           // Email
  email_verified?: boolean; // Si el email está verificado
  picture?: string;         // URL de la foto de perfil
  updated_at?: string;      // Última actualización
  [key: string]: any;       // Otros claims personalizados
}
```

## Ejemplos de Uso

### 1. Componente Básico de Autenticación

```tsx
import { useAuth0 } from "@auth0/auth0-react";

function LoginButton() {
  const { loginWithRedirect } = useAuth0();

  return (
    <button onClick={() => loginWithRedirect()}>
      Iniciar Sesión
    </button>
  );
}

function LogoutButton() {
  const { logout } = useAuth0();

  return (
    <button onClick={() => logout({ 
      logoutParams: { returnTo: window.location.origin } 
    })}>
      Cerrar Sesión
    </button>
  );
}
```

### 2. Mostrar Información del Usuario

```tsx
import { useAuth0 } from "@auth0/auth0-react";

function UserProfile() {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <div>No has iniciado sesión</div>;
  }

  return (
    <div>
      <img src={user?.picture} alt={user?.name} />
      <h2>{user?.name}</h2>
      <p>{user?.email}</p>
    </div>
  );
}
```

### 3. Registro de Nuevos Usuarios

```tsx
import { useAuth0 } from "@auth0/auth0-react";

function SignupButton() {
  const { loginWithRedirect } = useAuth0();

  const handleSignup = () => {
    loginWithRedirect({
      authorizationParams: {
        screen_hint: "signup", // Muestra la pantalla de registro
      },
    });
  };

  return (
    <button onClick={handleSignup}>
      Registrarse
    </button>
  );
}
```

### 4. Manejo de Errores

```tsx
import { useAuth0 } from "@auth0/auth0-react";

function AuthError() {
  const { error } = useAuth0();

  if (error) {
    return (
      <div className="error">
        <h3>Error de Autenticación</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return null;
}
```

## Casos de Uso Comunes

### Llamadas a API Protegidas

```tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

function ProtectedData() {
  const { getAccessTokenSilently } = useAuth0();
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener token de acceso
        const token = await getAccessTokenSilently();

        // Hacer llamada a API protegida
        const response = await fetch("https://api.example.com/data", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [getAccessTokenSilently]);

  return <div>{/* Renderizar datos */}</div>;
}
```

### Login con Popup (Alternativa)

```tsx
import { useAuth0 } from "@auth0/auth0-react";

function LoginWithPopup() {
  const { loginWithPopup } = useAuth0();

  const handleLogin = async () => {
    try {
      await loginWithPopup();
      console.log("Usuario autenticado");
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  return <button onClick={handleLogin}>Login con Popup</button>;
}
```

### Obtener Claims del Token ID

```tsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

function UserClaims() {
  const { getIdTokenClaims } = useAuth0();
  const [claims, setClaims] = useState(null);

  useEffect(() => {
    const fetchClaims = async () => {
      const idTokenClaims = await getIdTokenClaims();
      setClaims(idTokenClaims);
    };

    fetchClaims();
  }, [getIdTokenClaims]);

  return (
    <pre>
      {JSON.stringify(claims, null, 2)}
    </pre>
  );
}
```

## Protección de Rutas

### Componente de Ruta Protegida

```tsx
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate } from "react-router";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
```

### Uso en Routes

```tsx
import { Routes, Route } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      
      {/* Rutas protegidas */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

## Mejores Prácticas

### 1. Siempre Manejar el Estado de Carga

```tsx
const { isLoading, isAuthenticated } = useAuth0();

if (isLoading) {
  return <LoadingSpinner />;
}

// Continuar con la lógica de renderizado
```

### 2. Proporcionar returnTo en Logout

```tsx
logout({ 
  logoutParams: { 
    returnTo: window.location.origin 
  } 
});
```

### 3. Usar try/catch con Funciones Asíncronas

```tsx
const handleLogin = async () => {
  try {
    await loginWithPopup();
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### 4. Memoizar Funciones que Usan getAccessTokenSilently

```tsx
import { useCallback } from "react";

const fetchData = useCallback(async () => {
  const token = await getAccessTokenSilently();
  // Usar token...
}, [getAccessTokenSilently]);
```

### 5. No Almacenar Tokens en localStorage

El SDK de Auth0 maneja el almacenamiento de tokens de forma segura. No necesitas almacenarlos manualmente.

### 6. Verificar Autenticación Antes de Acciones Protegidas

```tsx
const handleProtectedAction = () => {
  if (!isAuthenticated) {
    loginWithRedirect({
      appState: { returnTo: window.location.pathname }
    });
    return;
  }
  
  // Realizar acción protegida
};
```

## Recursos Adicionales

- [Documentación oficial de Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Ejemplos de Auth0 React](https://github.com/auth0/auth0-react)

## Soporte

Para problemas o preguntas:
- Revisa la [documentación de Auth0](https://auth0.com/docs)
- Consulta el [Auth0 Community](https://community.auth0.com/)
- Revisa los logs en el [Auth0 Dashboard](https://manage.auth0.com/)
