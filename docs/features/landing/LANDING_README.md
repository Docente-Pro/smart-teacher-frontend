# 🚀 Landing Page DocentePro - Guía Rápida

## Inicio Rápido

### 1. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto:

```bash
VITE_AUTH0_DOMAIN=dev-uaweb6dupy6goyur.us.auth0.com
VITE_AUTH0_CLIENT_ID=nfKGnqiJ7isXoUXKbouhhjAQqXurJrem
VITE_BACKEND_URL=http://localhost:3000/api
```

### 2. Instalar Dependencias
```bash
pnpm install
```

### 3. Ejecutar en Desarrollo
```bash
pnpm dev
```

### 4. Navegar a la Landing
Abre `http://localhost:5173` en tu navegador.

## 🔄 Flujo de Usuario

### Usuario Nuevo (No Premium)
1. Accede a `/` → Ve la landing page
2. Click en "Comenzar Ahora" → Auth0 login/registro
3. Después del login → Vuelve a landing
4. Click en "Actualizar a Premium" → Flujo de pago

### Usuario Premium
1. Accede a `/` → Redirige automáticamente a `/dashboard`
2. Ve el dashboard con características premium

## 🧪 Cómo Probar

### Probar como Usuario Nuevo
1. Abre ventana de incógnito
2. Navega a `http://localhost:5173`
3. Deberías ver la landing page completa
4. Click en "Comenzar Ahora" → Inicia sesión con Auth0

### Probar el Flujo de Upgrade
1. Login como usuario no premium
2. Click en "Actualizar a Premium"
3. Verifica que se haga la llamada a `/api/pago/crear-preferencia`
4. Deberías ser redirigido a Mercado Pago (si el backend está configurado)

### Probar Páginas de Callback
- **Éxito**: Navega manualmente a `/pago-exitoso`
- **Error**: Navega manualmente a `/pago-fallido`

## 📁 Estructura de Archivos

```
src/
├── components/landing/
│   ├── Hero.tsx          # Sección hero
│   ├── Features.tsx      # Características
│   ├── Pricing.tsx       # Precios
│   └── Footer.tsx        # Footer
├── pages/
│   ├── LandingPage.tsx   # Página principal
│   ├── Dashboard.tsx     # Dashboard premium
│   ├── PaymentSuccess.tsx # Callback éxito
│   └── PaymentFailure.tsx # Callback error
├── hooks/
│   └── useUserStatus.ts  # Hook de estado premium
└── services/
    └── api.ts            # Servicio de API
```

## 🔧 Requisitos del Backend

El backend debe exponer estos endpoints:

### 1. Obtener Usuario por Email
```
GET /api/usuario/email/:email
```

**Respuesta exitosa (200)**:
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "suscripcion": {
    "plan": "gratuito",
    "fechaInicio": "2024-01-01"
  }
}
```

**Usuario no encontrado (404)**:
```json
{
  "message": "Usuario no encontrado"
}
```

### 2. Crear Usuario
```
POST /api/usuario
```

**Body**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "nombreInstitucion": "Colegio ABC",
  "nivelId": 1,
  "gradoId": 1,
  "problematicaId": 1,
  "suscripcion": {
    "fechaInicio": "2024-01-01",
    "plan": "gratuito"
  }
}
```

**Respuesta (201)**:
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com"
}
```

### 3. Crear Preferencia de Pago
```
POST /api/pago/crear-preferencia
```

**Body**:
```json
{
  "email": "juan@example.com",
  "nombre": "Juan Pérez",
  "plan": "premium"
}
```

**Respuesta (200)**:
```json
{
  "checkoutUrl": "https://www.mercadopago.com/mla/checkout/start?pref_id=XXXXX"
}
```

### 4. Webhook de Mercado Pago (Importante)
```
POST /api/pago/webhook
```

Cuando Mercado Pago confirma el pago, debe:
1. Actualizar suscripción en DB: `plan: "premium"`
2. Asignar rol "Subscriber" en Auth0 al usuario

## 🔐 Configuración Auth0

### Action: Add Roles to Token
En Auth0 Dashboard → Actions → Library → Create Action:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = "https://docente-pro.com";
  
  if (event.authorization) {
    api.idToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);
  }
};
```

### Crear Rol "Subscriber"
1. Auth0 Dashboard → User Management → Roles
2. Create Role → Name: "Subscriber"
3. Asignar este rol a usuarios premium desde el backend

## ⚙️ Configuración Mercado Pago

### URLs de Callback
En Mercado Pago Dashboard, configura:

- **URL de éxito**: `https://tu-dominio.com/pago-exitoso`
- **URL de error**: `https://tu-dominio.com/pago-fallido`
- **Webhook URL**: `https://tu-backend.com/api/pago/webhook`

## 🐛 Troubleshooting

### Error: "Cannot read property 'email' of undefined"
- Verifica que el usuario esté autenticado
- Revisa que Auth0 esté configurado correctamente

### Error: "Network Error" al hacer upgrade
- Verifica que el backend esté corriendo en `http://localhost:3000`
- Revisa la variable `VITE_BACKEND_URL` en `.env.local`

### No redirige a Dashboard después del pago
- Asegúrate que el webhook de Mercado Pago esté funcionando
- Verifica que el rol "Subscriber" se asigne correctamente
- Usa `window.location.reload()` para refrescar el token

### Usuario premium sigue viendo la landing
- Verifica que el rol "Subscriber" esté en el token
- Revisa que el Action de Auth0 esté deployado
- Chequea en `useUserStatus` que la verificación sea correcta

## 📊 Testing con Mercado Pago

### Tarjetas de Prueba
Usa estas tarjetas en el sandbox de Mercado Pago:

**Pago Aprobado**:
- Tarjeta: `5031 7557 3453 0604`
- CVV: `123`
- Fecha: Cualquier fecha futura

**Pago Rechazado**:
- Tarjeta: `5031 4332 1540 6351`
- CVV: `123`
- Fecha: Cualquier fecha futura

## 🎨 Personalización

### Cambiar Colores
Edita `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: "#tu-color-primario",
      secondary: "#tu-color-secundario"
    }
  }
}
```

### Cambiar Precio
Edita `src/components/landing/Pricing.tsx`:

```tsx
<div className="text-4xl font-bold">
  S/29.90<span className="text-lg font-normal">/mes</span>
</div>
```

### Modificar Características
Edita `src/components/landing/Features.tsx` o `Pricing.tsx`.

## 📚 Documentación Adicional

- [Documentación completa del flujo](./landing-payment-flow.md)
- [Resumen de implementación](./LANDING_IMPLEMENTATION_SUMMARY.md)
- [Guía de uso de Auth0](./auth0-usage.md)

## 🚀 Deploy a Producción

### 1. Variables de Entorno
Configura en tu servicio de hosting:

```bash
VITE_AUTH0_DOMAIN=tu-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=tu-client-id
VITE_BACKEND_URL=https://tu-backend.com/api
```

### 2. Build
```bash
pnpm build
```

### 3. Configurar Callbacks
En Auth0 Dashboard → Applications → Settings:
- Allowed Callback URLs: `https://tu-dominio.com`
- Allowed Logout URLs: `https://tu-dominio.com`
- Allowed Web Origins: `https://tu-dominio.com`

## ✅ Checklist Pre-Deploy

- [ ] Variables de entorno configuradas en producción
- [ ] Backend deployado y accesible
- [ ] Auth0 configurado con URLs de producción
- [ ] Mercado Pago configurado con callbacks de producción
- [ ] Webhook de Mercado Pago funcionando
- [ ] Tests de flujo completo realizados
- [ ] Rol "Subscriber" creado en Auth0
- [ ] Action "Add roles to token" deployado

---

**¿Necesitas ayuda?** Revisa la documentación completa en `docs/` o contacta al equipo de desarrollo.
