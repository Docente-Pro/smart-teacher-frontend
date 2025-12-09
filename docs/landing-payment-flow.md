# Sistema de Landing Page y Pagos - DocentePro

## Descripción General

Sistema completo de landing page con autenticación Auth0 y flujo de pago con Mercado Pago para upgrade a plan premium.

## Estructura de Archivos

### Componentes de Landing
- **`src/components/landing/Hero.tsx`**: Sección hero con CTA y estadísticas
- **`src/components/landing/Features.tsx`**: Tarjetas de características principales
- **`src/components/landing/Pricing.tsx`**: Tarjeta de precio con botón de upgrade
- **`src/components/landing/Footer.tsx`**: Footer con enlaces y redes sociales

### Páginas
- **`src/pages/LandingPage.tsx`**: Página principal (ruta `/`)
- **`src/pages/Dashboard.tsx`**: Dashboard para usuarios premium (ruta `/dashboard`)
- **`src/pages/PaymentSuccess.tsx`**: Página de éxito del pago (ruta `/pago-exitoso`)
- **`src/pages/PaymentFailure.tsx`**: Página de error del pago (ruta `/pago-fallido`)

### Hooks y Servicios
- **`src/hooks/useUserStatus.ts`**: Hook para verificar estado premium del usuario
- **`src/services/api.ts`**: Servicio de API con métodos para usuarios y pagos

## Flujo de Upgrade a Premium

### 1. Usuario en Landing Page
```
Usuario hace clic en "Actualizar a Premium"
↓
LandingPage.handleUpgradeClick()
```

### 2. Verificación de Usuario
```tsx
const existingUser = await getUserByEmail(user.email);

Si usuario NO existe (404):
  → Crear usuario con suscripcion gratuita
  → const newUser = await createUser(usuarioData)
  
Si usuario existe:
  → Continuar con el pago
```

### 3. Creación de Preferencia de Pago
```tsx
const preference = await createPaymentPreference({
  email: user.email,
  nombre: user.name,
  plan: "premium"
});

// Backend retorna: { checkoutUrl: "https://mercadopago.com/..." }
window.location.href = preference.checkoutUrl;
```

### 4. Mercado Pago
```
Usuario completa el pago en Mercado Pago
↓
Mercado Pago redirige según resultado:
  - Éxito: /pago-exitoso
  - Error: /pago-fallido
```

### 5. Callback de Éxito
```tsx
// PaymentSuccess.tsx
useEffect(() => {
  window.location.reload(); // Recargar para obtener nuevo token con rol
  
  setTimeout(() => {
    navigate("/dashboard"); // Redirigir a dashboard
  }, 3000);
}, []);
```

## Verificación de Estado Premium

### useUserStatus Hook
```tsx
const { isPremium, isLoading, user } = useUserStatus();

// Verifica si el usuario tiene el rol "Subscriber"
const roles = user?.["https://docente-pro.com/roles"] || [];
const isPremium = roles.includes("Subscriber");
```

### Uso en Componentes
```tsx
// LandingPage.tsx
useEffect(() => {
  if (!isLoading && isPremium) {
    navigate("/dashboard"); // Redirigir usuarios premium
  }
}, [isPremium, isLoading, navigate]);
```

## API Endpoints

### Backend Endpoints Necesarios

#### 1. Obtener Usuario por Email
```
GET /api/usuario/email/:email
Response: IUsuario | 404
```

#### 2. Crear Usuario
```
POST /api/usuario
Body: IUsuarioToCreate
Response: IUsuario
```

#### 3. Crear Preferencia de Pago
```
POST /api/pago/crear-preferencia
Body: { email, nombre, plan }
Response: { checkoutUrl: string }
```

## Interfaces de Datos

### IUsuarioToCreate
```typescript
interface IUsuarioToCreate {
  nombre: string;
  email: string;
  nombreInstitucion: string;
  nivelId: number;
  gradoId: number;
  problematicaId: number;
  suscripcion: {
    fechaInicio: string;
    plan: "gratuito" | "premium";
  };
}
```

### Payment Preference Request
```typescript
interface PaymentPreferenceRequest {
  email: string;
  nombre: string;
  plan: "premium";
}
```

## Configuración Auth0

### Custom Claims
El backend debe agregar el rol "Subscriber" al token cuando el usuario paga:

```javascript
// Auth0 Action: Add roles to token
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://docente-pro.com";
  
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

### Actualizar Rol Después del Pago
Cuando Mercado Pago confirma el pago, el backend debe:
1. Actualizar la suscripción en la base de datos
2. Asignar el rol "Subscriber" al usuario en Auth0

```typescript
// Después de confirmar el pago
await auth0Management.assignRolesToUser(
  { id: userId },
  { roles: ["rol_subscriber_id"] }
);
```

## Variables de Entorno

```bash
# .env.local
VITE_AUTH0_DOMAIN=dev-uaweb6dupy6goyur.us.auth0.com
VITE_AUTH0_CLIENT_ID=nfKGnqiJ7isXoUXKbouhhjAQqXurJrem
VITE_BACKEND_URL=http://localhost:3000/api
```

## Rutas Configuradas

```tsx
export const routes = [
  { path: "/", element: <LandingPage /> },
  { path: "/dashboard", element: <RouteProtector><Dashboard /></RouteProtector> },
  { path: "/pago-exitoso", element: <RouteProtector><PaymentSuccess /></RouteProtector> },
  { path: "/pago-fallido", element: <RouteProtector><PaymentFailure /></RouteProtector> },
  // ... otras rutas
];
```

## Flujo Completo de Usuario Nuevo

```
1. Usuario llega a Landing Page (/)
   ↓
2. Hace clic en "Comenzar Ahora"
   ↓
3. Auth0 login/register
   ↓
4. Vuelve a Landing Page
   ↓
5. Usuario hace clic en "Actualizar a Premium"
   ↓
6. Sistema verifica si usuario existe en DB
   ↓
7. Si no existe: crear usuario con plan gratuito
   ↓
8. Crear preferencia de pago en Mercado Pago
   ↓
9. Redirigir a Mercado Pago
   ↓
10. Usuario completa el pago
    ↓
11. Mercado Pago redirige a /pago-exitoso
    ↓
12. Backend procesa webhook de Mercado Pago
    ↓
13. Backend actualiza suscripción y asigna rol "Subscriber"
    ↓
14. Frontend recarga para obtener nuevo token
    ↓
15. Redirigir a /dashboard
    ↓
16. Usuario premium accede a todas las funcionalidades
```

## Testing del Flujo

### 1. Usuario Premium Existente
```bash
# Navegar a /
# Debe redirigir automáticamente a /dashboard
```

### 2. Usuario No Premium
```bash
# Navegar a /
# Ver landing page con botón "Actualizar a Premium"
# Click en botón debe crear preferencia y redirigir a Mercado Pago
```

### 3. Callback de Éxito
```bash
# Navegar directamente a /pago-exitoso
# Debe mostrar mensaje de éxito
# Debe redirigir a /dashboard después de 3 segundos
```

### 4. Callback de Error
```bash
# Navegar directamente a /pago-fallido
# Debe mostrar mensaje de error
# Botón "Reintentar" debe redirigir a /
```

## Consideraciones de Seguridad

1. **Validación Backend**: Siempre validar el pago en el backend mediante webhooks de Mercado Pago
2. **No confiar en Frontend**: El rol no se actualiza desde el frontend, solo desde el backend
3. **Token Refresh**: Usar `window.location.reload()` para obtener el token actualizado con el nuevo rol
4. **HTTPS en Producción**: Usar HTTPS para todas las URLs de callback

## Próximos Pasos

1. Implementar webhook de Mercado Pago en el backend
2. Configurar URLs de callback en Mercado Pago Dashboard
3. Implementar lógica de asignación de rol en Auth0 desde el backend
4. Agregar manejo de errores más robusto
5. Implementar analytics para trackear conversiones
