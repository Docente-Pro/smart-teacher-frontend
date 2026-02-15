# 💳 Sistema de Pagos - DocentePro

## ✅ Implementación Completada

Se ha implementado exitosamente el sistema de pagos con Mercado Pago en el frontend de DocentePro.

---

## 📁 Estructura de Archivos Creados

### **Interfaces TypeScript**
- `src/interfaces/ISuscripcion.ts` - Tipos para planes, suscripciones y pagos
- `src/interfaces/IPago.ts` - Tipos para historial de pagos

### **Servicios de API**
- `src/services/pago.service.ts` - Integración con endpoints de Mercado Pago

### **Hooks Personalizados**
- `src/hooks/useSubscription.ts` - Gestión de estado de suscripción del usuario

### **Componentes UI**
- `src/components/Pricing/PricingCard.tsx` - Card de plan con precio y features
- `src/components/Pricing/SubscriptionBadge.tsx` - Badge de plan actual
- `src/components/Pricing/UpgradePrompt.tsx` - Prompt para actualizar a Premium
- `src/components/Pricing/SessionCounter.tsx` - Contador de sesiones gratuitas
- `src/components/Pricing/CreateSessionButton.tsx` - Botón de crear sesión con protección
- `src/components/Pricing/PremiumGuard.tsx` - Guard para funciones Premium

### **Páginas**
- `src/pages/Planes.tsx` - Página de planes de suscripción
- `src/pages/PagoExitoso.tsx` - Confirmación de pago exitoso
- `src/pages/PagoFallido.tsx` - Página de pago rechazado
- `src/pages/PagoPendiente.tsx` - Página de pago en proceso

### **Rutas Configuradas**
- `/planes` - Página de planes
- `/pago-exitoso` - Redirección después de pago exitoso
- `/pago-fallido` - Redirección después de pago rechazado
- `/pago-pendiente` - Redirección después de pago pendiente

---

## 🎯 Funcionalidades Implementadas

### ✅ **Página de Planes**
- 3 planes: Free (2 sesiones), Premium Mensual (S/ 29.90), Premium Anual (S/ 299.00)
- Badge "Más Popular" en Premium Mensual
- Badge "Mejor Valor" con ahorro en Premium Anual
- Lista de características con checkmarks
- Integración con colores de DocentePro
- Botones de suscripción con estados de loading

### ✅ **Flujo de Pago**
1. Usuario hace click en "Suscribirme Ahora"
2. Se crea preferencia de pago en el backend
3. Redirección automática a Mercado Pago (sandbox en dev, producción en prod)
4. Webhook actualiza suscripción automáticamente
5. Usuario regresa a página de confirmación

### ✅ **Páginas de Redirección**
- **Pago Exitoso**: Animación de éxito, lista de funciones desbloqueadas, refetch automático de suscripción
- **Pago Fallido**: Razones comunes, botón de reintentar, link de soporte
- **Pago Pendiente**: Información de proceso de verificación, timeline de pasos

### ✅ **Hook `useSubscription`**
Expone:
- `isPremium` - Indica si el usuario tiene plan premium activo
- `plan` - Plan actual del usuario ('free', 'premium_mensual', 'premium_anual')
- `isActive` - Estado de la suscripción
- `expiresAt` - Fecha de expiración
- `sessionsUsed` - Número de sesiones usadas
- `sessionsLimit` - Límite de sesiones (2 para free)
- `canCreateSession` - Boolean que indica si puede crear sesión
- `refetch()` - Función para recargar estado de suscripción

### ✅ **Protección de Funciones Premium**
- `SessionCounter` - Muestra progreso de sesiones gratuitas
- `UpgradePrompt` - Banner/Card/Modal para upgrade
- `PremiumGuard` - Componente guard para proteger funciones
- `usePremiumFeature` - Hook para validar acceso a features

---

## 🔧 Cómo Usar

### **1. Mostrar la página de planes**

```tsx
import { useNavigate } from "react-router";

function MiComponente() {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate('/planes')}>
      Ver Planes
    </button>
  );
}
```

### **2. Usar el hook de suscripción**

```tsx
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";

function MiComponente() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  
  const { 
    isPremium, 
    plan, 
    sessionsUsed, 
    sessionsLimit, 
    canCreateSession 
  } = useSubscription(userId);

  if (!canCreateSession) {
    return <div>Has agotado tus sesiones gratuitas</div>;
  }

  return <button>Crear Nueva Sesión</button>;
}
```

### **3. Proteger funciones Premium**

```tsx
import { PremiumGuard } from "@/components/Pricing/PremiumGuard";

function ExportarPDF() {
  return (
    <PremiumGuard feature="Exportar a PDF">
      <button onClick={handleExport}>Exportar PDF</button>
    </PremiumGuard>
  );
}
```

### **4. Usar el componente de crear sesión**

```tsx
import { CreateSessionButton } from "@/components/Pricing/CreateSessionButton";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <CreateSessionButton />
    </div>
  );
}
```

---

## 🌐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```bash
VITE_API_URL=http://localhost:3000
```

Para producción:

```bash
VITE_API_URL=https://api.docentepro.com
```

---

## 🎨 Integración con Tema DocentePro

Todos los componentes usan la paleta de colores de DocentePro:

- **Azul Primario**: `#004e98` - Botones principales, badges
- **Naranja Acción**: `#ff6700` - CTAs, botones de suscripción
- **Grises**: `#fafafa`, `#ebebeb`, `#c0c0c0` - Fondos, bordes
- **Fuente**: Inter (Google Fonts)
- **Border Radius**: 8px (0.5rem)

---

## 📊 Flujo de Datos

```
1. Usuario → Click "Suscribirme" → POST /api/pago/crear-preferencia
2. Backend → Mercado Pago API → Devuelve checkoutUrl
3. Frontend → Redirige a checkoutUrl (Mercado Pago)
4. Usuario completa pago en MP
5. Mercado Pago → Webhook → Backend → Actualiza DB + Auth0
6. Mercado Pago → Redirige usuario a /pago-exitoso
7. Frontend → refetch() suscripción → Actualiza UI
```

---

## 🔒 Protección de Sesiones

Las **2 sesiones gratuitas son únicas por vida**:

- Se cuentan por `usuario.sesiones.length`
- No se renuevan nunca
- Después de usar 2 sesiones, DEBE actualizar a Premium

---

## 📱 Testing

### **Desarrollo (localhost)**
- Usa `sandboxCheckoutUrl` automáticamente
- Tarjetas de prueba de Mercado Pago: https://www.mercadopago.com.pe/developers/es/docs/checkout-pro/additional-content/test-cards

### **Producción**
- Usa `checkoutUrl` automáticamente
- Pagos reales con tarjetas reales

---

## 🚀 Siguiente Paso: Integrar en Dashboard

Para completar la integración, debes:

1. **Agregar el botón en tu Dashboard**:
   ```tsx
   import { CreateSessionButton } from "@/components/Pricing/CreateSessionButton";
   
   // En tu Dashboard component
   <CreateSessionButton />
   ```

2. **Proteger la ruta de crear sesión**:
   ```tsx
   // En el componente de crear sesión
   const { canCreateSession } = useSubscription(userId);
   
   if (!canCreateSession) {
     return <Redirect to="/planes" />;
   }
   ```

3. **Agregar badge de plan en el perfil**:
   ```tsx
   import { SubscriptionBadge } from "@/components/Pricing/SubscriptionBadge";
   
   <SubscriptionBadge plan={plan} />
   ```

---

## 📞 Soporte

Si tienes preguntas sobre la implementación:
- Revisa el código en `src/pages/Planes.tsx` (ejemplo completo)
- Revisa `src/hooks/useSubscription.ts` (lógica de suscripción)
- Revisa `src/components/Pricing/CreateSessionButton.tsx` (ejemplo de integración)

---

## ✅ Checklist Final

- [x] Interfaces TypeScript creadas
- [x] Servicios de API configurados
- [x] Hook useSubscription implementado
- [x] Componentes UI creados
- [x] Página de Planes diseñada
- [x] Páginas de redirección creadas
- [x] Rutas configuradas en React Router
- [x] Protección de funciones Premium
- [x] Contador de sesiones gratuitas
- [x] Documentación completa

---

**¡Sistema de pagos listo para usar!** 🎉
