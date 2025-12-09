# Smart Teacher Frontend - Autenticación Personalizada con Auth0

## 🔐 Flujo de Autenticación

Este proyecto implementa un **login 100% personalizado** que mantiene todos los beneficios del SDK de Auth0 sin usar Universal Login ni redirecciones.

### Arquitectura del Flujo

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   UI React      │─────▶│  Backend API    │─────▶│   Auth0 API     │
│  (LoginForm)    │      │  /api/auth/*    │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
        │                         │
        │  3. Tokens              │
        │◀────────────────────────│
        │
        ▼
┌─────────────────┐
│  Token Inject   │
│  Auth0 SDK      │
│  (memoria)      │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│  isAuthenticated│
│  user           │
│  getAccessToken │
└─────────────────┘
```

## 🎯 ¿Por qué este enfoque?

### ❌ Lo que NO usamos:
- `loginWithRedirect()` - Redirige a Auth0 Universal Login
- `loginWithPopup()` - Abre popup de Auth0
- Auth0 Lock Widget - UI predefinida de Auth0
- localStorage para tokens - Inseguro
- Manual token management - Pierde beneficios de Auth0

### ✅ Lo que SÍ usamos:
- UI 100% personalizada en React
- Backend propio maneja la comunicación con Auth0
- Inyección manual de tokens en Auth0 SDK
- Hooks de Auth0 (`isAuthenticated`, `user`, `logout`)
- Tokens en memoria (más seguro)
- Refresh tokens manejados por backend

## 🚀 Flujo de Login Paso a Paso

### 1. Usuario ingresa credenciales

```tsx
// LoginForm.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 1. Llamar al backend
  const tokens = await loginWithBackend({
    email: credentials.email,
    password: credentials.password,
  });
  
  // 2. Inyectar tokens en Auth0 SDK
  await injectTokensIntoAuth0(tokens);
  
  // 3. Navegar (isAuthenticated ya es true)
  navigate('/dashboard');
};
```

### 2. Backend obtiene tokens de Auth0

```typescript
// Backend: /api/auth/login
POST https://YOUR_DOMAIN.auth0.com/oauth/token
{
  "grant_type": "http://auth0.com/oauth/grant-type/password-realm",
  "username": "user@example.com",
  "password": "password123",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "realm": "Username-Password-Authentication",
  "scope": "openid profile email"
}

// Respuesta:
{
  "access_token": "eyJhbGc...",
  "id_token": "eyJhbGc...",
  "expires_in": 86400,
  "token_type": "Bearer",
  "refresh_token": "v1.MRr..."
}
```

### 3. Frontend inyecta tokens en Auth0 SDK

```typescript
// auth0Client.service.ts
export const injectTokensIntoAuth0 = async (tokens: TokenResponse) => {
  const client = await getAuth0Client();
  
  // Método interno de Auth0 (no documentado pero funcional)
  await (client as any)._processTokenResponse({
    access_token: tokens.access_token,
    id_token: tokens.id_token,
    expires_in: tokens.expires_in,
    token_type: tokens.token_type,
    refresh_token: tokens.refresh_token,
  });
  
  // Ahora isAuthenticated = true ✅
  // Ahora user contiene el perfil ✅
};
```

### 4. Usar hooks de Auth0 normalmente

```tsx
// Cualquier componente
import { useAuth0 } from '@auth0/auth0-react';

function MyComponent() {
  const { isAuthenticated, user, getAccessTokenSilently } = useAuth0();
  
  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }
  
  return <div>Hola {user?.name}</div>;
}
```

## 📁 Estructura de Archivos

```
src/
├── services/
│   ├── auth0Client.service.ts       # Maneja Auth0Client e inyección
│   └── backendAuth.service.ts       # Llamadas al backend API
├── providers/
│   └── CustomAuth0Provider.tsx      # Provider personalizado
├── features/auth-screens/login/
│   └── components/
│       └── LoginForm.tsx            # UI personalizada de login
└── auth/
    └── RouteProtector.tsx           # Protección de rutas
```

## 🔧 Configuración

### Variables de Entorno

Crea un archivo `.env`:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=dev-uaweb6dupy6goyur.us.auth0.com
VITE_AUTH0_CLIENT_ID=8j76pZYvlriLAHVoHHgLGItEgfKCZb3D
VITE_AUTH0_AUDIENCE=https://api.docente-pro.com

# Backend API
VITE_API_URL=http://localhost:3000
```

### Auth0 Dashboard Configuration

1. **Application Type**: Single Page Application (SPA)
2. **Grant Types**: 
   - Password ✅
   - Refresh Token ✅
3. **Advanced Settings**:
   - Mark as "First Party Application" ✅
4. **Connections**: Enable "Username-Password-Authentication"

## 🛠️ Servicios Principales

### 1. auth0Client.service.ts

**Propósito**: Manejar la instancia de Auth0Client y la inyección de tokens

**Funciones principales**:
- `getAuth0Client()` - Obtiene/crea instancia singleton
- `injectTokensIntoAuth0(tokens)` - Inyecta tokens en el SDK
- `clearAuth0Session()` - Limpia la sesión

```typescript
import { Auth0Client } from '@auth0/auth0-spa-js';

let auth0ClientInstance: Auth0Client | null = null;

export const getAuth0Client = async (): Promise<Auth0Client> => {
  if (!auth0ClientInstance) {
    auth0ClientInstance = new Auth0Client({
      domain: import.meta.env.VITE_AUTH0_DOMAIN,
      clientId: import.meta.env.VITE_AUTH0_CLIENT_ID,
      authorizationParams: {
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
      },
      cacheLocation: 'memory', // ⚠️ Importante: no usar localStorage
      useRefreshTokens: false,  // Backend maneja esto
    });
  }
  return auth0ClientInstance;
};
```

### 2. backendAuth.service.ts

**Propósito**: Comunicación con el backend para autenticación

**Endpoints**:
- `POST /api/auth/login` - Obtener tokens
- `POST /api/auth/logout` - Invalidar sesión
- `POST /api/auth/refresh` - Refrescar access token

```typescript
export const loginWithBackend = async (credentials: LoginCredentials) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    email: credentials.email,
    password: credentials.password,
  });
  return response.data; // { access_token, id_token, expires_in, ... }
};
```

### 3. CustomAuth0Provider.tsx

**Propósito**: Provider personalizado que NO usa redirects

**Características**:
- `cacheLocation: 'memory'` - Tokens solo en RAM
- `useRefreshTokens: false` - Backend maneja refresh
- `skipRedirectCallback: true` - No procesar callbacks
- Hook `useCustomAuth()` con logout personalizado

```typescript
<Auth0Provider
  domain={import.meta.env.VITE_AUTH0_DOMAIN}
  clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
  cacheLocation="memory"
  useRefreshTokens={false}
  skipRedirectCallback={true}
>
  {children}
</Auth0Provider>
```

## 🔐 Seguridad

### ✅ Mejores Prácticas Implementadas

1. **Tokens en Memoria**: No se guardan en localStorage
2. **Client Secret en Backend**: Nunca expuesto en frontend
3. **Refresh Tokens en Backend**: Manejados por el servidor
4. **HTTPS Obligatorio**: En producción
5. **CORS Configurado**: Solo orígenes permitidos

### ⚠️ Consideraciones

- Los tokens se pierden al refrescar la página (esto es intencional por seguridad)
- Implementar refresh silencioso al cargar la app
- Usar httpOnly cookies para refresh tokens en producción

## 🧪 Testing

### Probar el Login

```bash
# 1. Iniciar el backend (debe estar configurado)
cd backend
npm run dev

# 2. Iniciar el frontend
cd frontend
pnpm dev

# 3. Ir a http://localhost:5173/login
# 4. Ingresar credenciales
# 5. Verificar que se inyectan los tokens
```

### Verificar Estado de Auth0

```javascript
// En DevTools Console
import { getAuth0Client } from './services/auth0Client.service';

const client = await getAuth0Client();
const isAuth = await client.isAuthenticated();
const user = await client.getUser();

console.log('Authenticated:', isAuth);
console.log('User:', user);
```

## 📊 Comparación con Universal Login

| Característica | Universal Login | Login Personalizado |
|----------------|-----------------|---------------------|
| UI Personalizable | ❌ Limitado | ✅ 100% control |
| Redirecciones | ✅ Full page redirect | ❌ Sin redirects |
| Tokens Management | ✅ Automático | ⚠️ Manual injection |
| isAuthenticated | ✅ Funciona | ✅ Funciona |
| user Hook | ✅ Funciona | ✅ Funciona |
| Refresh Tokens | ✅ Automático | ⚠️ Backend maneja |
| Seguridad | ✅ Máxima | ⚠️ Requiere cuidado |

## 🐛 Troubleshooting

### Problema: isAuthenticated siempre es false

**Solución**: Verificar que la inyección de tokens se ejecutó correctamente

```typescript
// Agregar logs en auth0Client.service.ts
console.log('Inyectando tokens:', tokens);
await injectTokensIntoAuth0(tokens);
console.log('Tokens inyectados, verificando...');
const client = await getAuth0Client();
const isAuth = await client.isAuthenticated();
console.log('isAuthenticated:', isAuth);
```

### Problema: Tokens se pierden al refrescar

**Esperado**: Los tokens están en memoria, se pierden al refrescar.

**Solución**: Implementar silent refresh al cargar la app:

```typescript
// App.tsx
useEffect(() => {
  const refreshSession = async () => {
    try {
      const tokens = await refreshAccessToken();
      await injectTokensIntoAuth0(tokens);
    } catch (error) {
      // Redirigir a login
      navigate('/login');
    }
  };
  
  if (!isAuthenticated) {
    refreshSession();
  }
}, []);
```

### Problema: Backend devuelve 401

**Causas**:
1. Client Secret incorrecto
2. Grant type no habilitado en Auth0
3. Conexión no habilitada
4. Credenciales incorrectas

**Solución**: Verificar configuración en Auth0 Dashboard

## 📚 Recursos

- [Auth0 SPA SDK](https://auth0.com/docs/libraries/auth0-spa-js)
- [Resource Owner Password Grant](https://auth0.com/docs/get-started/authentication-and-authorization-flow/resource-owner-password-flow)
- [Auth0 React SDK](https://auth0.com/docs/libraries/auth0-react)

## 🤝 Contribución

Si encuentras bugs o mejoras, por favor abre un issue o PR.

## 📝 Notas Importantes

1. **No usar en producción sin HTTPS**: Los tokens deben transmitirse por conexión segura
2. **Implementar rate limiting**: Prevenir ataques de fuerza bruta
3. **Considerar MFA**: Agregar autenticación de múltiples factores
4. **Monitorear sesiones**: Logs de autenticación en backend
5. **Políticas de contraseñas**: Validar fortaleza en backend

---

**Versión**: 1.0.0  
**Última actualización**: 4 de diciembre de 2025  
**Mantenedor**: Angelo Mancilla
