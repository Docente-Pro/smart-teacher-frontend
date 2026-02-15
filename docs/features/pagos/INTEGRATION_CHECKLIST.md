# ✅ CHECKLIST DE INTEGRACIÓN - SISTEMA DE PAGOS

## 📋 PASOS PARA COMPLETAR LA INTEGRACIÓN

### 1. ✅ **Variables de Entorno**
- [ ] Crear archivo `.env` en la raíz del proyecto
- [ ] Agregar `VITE_API_URL=http://localhost:3000`
- [ ] Para producción: `VITE_API_URL=https://api.docentepro.com`

### 2. ✅ **Backend Configurado**
- [ ] Verificar que el backend esté corriendo en `http://localhost:3000`
- [ ] Confirmar endpoints disponibles:
  - `POST /api/pago/crear-preferencia`
  - `GET /api/usuario/:usuarioId`
  - `GET /api/pago/usuario/:usuarioId`
- [ ] Verificar webhook de Mercado Pago configurado

### 3. ✅ **Mercado Pago Dashboard**
- [ ] Configurar URLs de redirección:
  - Success: `http://localhost:5173/pago-exitoso` (dev)
  - Failure: `http://localhost:5173/pago-fallido` (dev)
  - Pending: `http://localhost:5173/pago-pendiente` (dev)
- [ ] Obtener tarjetas de prueba para testing
- [ ] Verificar que el webhook esté activo

### 4. 🎨 **Integrar en Dashboard**

**Opción A: Usar el componente completo**
```tsx
// En tu Dashboard.tsx
import { CreateSessionButton } from "@/components/Pricing/CreateSessionButton";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <CreateSessionButton /> {/* Ya tiene todo integrado */}
    </div>
  );
}
```

**Opción B: Implementación manual**
```tsx
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router";

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  
  const { canCreateSession, sessionsUsed, sessionsLimit } = useSubscription(userId);

  const handleCreateSession = () => {
    if (!canCreateSession) {
      navigate('/planes');
      return;
    }
    navigate('/crear-sesion');
  };

  return (
    <div>
      <button onClick={handleCreateSession}>
        {canCreateSession ? 'Nueva Sesión' : '🔒 Actualizar a Premium'}
      </button>
      <p>{sessionsUsed} de {sessionsLimit} sesiones usadas</p>
    </div>
  );
}
```

### 5. 🔒 **Proteger Ruta de Crear Sesión**

**Agregar validación en `/crear-sesion`:**
```tsx
// En CuestionarioSesion.tsx o tu componente de crear sesión
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router";
import { useEffect } from "react";

function CuestionarioSesion() {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const { canCreateSession, isLoading } = useSubscription(userId);

  useEffect(() => {
    if (!isLoading && !canCreateSession) {
      navigate('/planes');
    }
  }, [canCreateSession, isLoading, navigate]);

  if (isLoading) return <div>Cargando...</div>;
  if (!canCreateSession) return null;

  return (
    <div>
      {/* Tu formulario de crear sesión */}
    </div>
  );
}
```

### 6. 👤 **Agregar Badge de Plan en Perfil**

```tsx
import { SubscriptionBadge } from "@/components/Pricing/SubscriptionBadge";
import { useAuth0 } from "@/hooks/useAuth0";
import { useSubscription } from "@/hooks/useSubscription";

function UserProfile() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const { plan } = useSubscription(userId);

  return (
    <div>
      <h2>Mi Perfil</h2>
      <SubscriptionBadge plan={plan} />
    </div>
  );
}
```

### 7. 🎯 **Agregar Link a Planes en Navbar/Sidebar**

```tsx
// En tu Navbar/Sidebar
<Link to="/planes">
  💎 Ver Planes
</Link>
```

### 8. ⚠️ **Mostrar Advertencia Cuando Quedan Pocas Sesiones**

```tsx
import { UpgradePrompt } from "@/components/Pricing/UpgradePrompt";

function Dashboard() {
  const { user } = useAuth0();
  const userId = (user as any)?.sub;
  const navigate = useNavigate();
  const { isPremium, sessionsUsed, sessionsLimit, canCreateSession } = useSubscription(userId);

  const showWarning = !isPremium && canCreateSession && sessionsUsed === sessionsLimit - 1;

  return (
    <div>
      {showWarning && (
        <UpgradePrompt
          message="Esta es tu última sesión gratuita"
          sessionsUsed={sessionsUsed}
          sessionsLimit={sessionsLimit}
          onUpgrade={() => navigate('/planes')}
          variant="banner"
        />
      )}
    </div>
  );
}
```

### 9. 🔐 **Proteger Funciones Premium**

**Ejemplo: Exportar PDF**
```tsx
import { PremiumGuard } from "@/components/Pricing/PremiumGuard";

function ExportButton() {
  return (
    <PremiumGuard feature="Exportar a PDF">
      <button onClick={handleExport}>📄 Exportar PDF</button>
    </PremiumGuard>
  );
}
```

**Ejemplo: Asistente IA Avanzado**
```tsx
import { usePremiumFeature } from "@/components/Pricing/PremiumGuard";

function AIButton() {
  const { canUseFeature, showUpgradePrompt } = usePremiumFeature();

  const handleUseAI = () => {
    if (!canUseFeature) {
      showUpgradePrompt('Asistente IA Avanzado');
      return;
    }
    // Usar IA
  };

  return <button onClick={handleUseAI}>🤖 Usar IA</button>;
}
```

### 10. 📊 **Historial de Pagos (Opcional)**

```tsx
import { PaymentHistory } from "@/components/Pricing/PaymentHistory";

function ProfilePage() {
  return (
    <div>
      <h2>Historial de Pagos</h2>
      <PaymentHistory />
    </div>
  );
}
```

---

## 🧪 TESTING

### **1. Probar Plan Free**
- [ ] Crear cuenta nueva
- [ ] Verificar que tenga plan "free"
- [ ] Crear primera sesión (debe funcionar)
- [ ] Crear segunda sesión (debe funcionar)
- [ ] Intentar crear tercera sesión (debe redirigir a /planes)
- [ ] Verificar contador: "2 de 2 sesiones usadas"

### **2. Probar Flujo de Pago**
- [ ] Navegar a `/planes`
- [ ] Click en "Suscribirme Ahora" (Premium Mensual)
- [ ] Verificar redirección a Mercado Pago sandbox
- [ ] Usar tarjeta de prueba aprobada:
  - Número: `5031 7557 3453 0604`
  - CVV: `123`
  - Vencimiento: `11/25`
  - Nombre: `APRO` (para aprobación)
- [ ] Completar pago
- [ ] Verificar redirección a `/pago-exitoso`
- [ ] Verificar badge "Premium Mensual"
- [ ] Intentar crear sesión (debe funcionar sin límite)

### **3. Probar Pago Rechazado**
- [ ] Usar tarjeta de prueba rechazada:
  - Nombre: `OTHE` (para rechazo)
- [ ] Verificar redirección a `/pago-fallido`
- [ ] Click en "Reintentar Pago"
- [ ] Verificar redirección a `/planes`

### **4. Probar Pago Pendiente**
- [ ] Usar método de pago pendiente (transferencia)
- [ ] Verificar redirección a `/pago-pendiente`
- [ ] Click en "Volver al Dashboard"

---

## 🚨 PROBLEMAS COMUNES

### **Error: "Cannot read properties of undefined (reading 'sub')"**
**Solución:**
```tsx
const { user } = useAuth0();
const userId = (user as any)?.sub || null; // Usar optional chaining
```

### **Error: "401 Unauthorized" en API**
**Solución:**
- Verificar que el token de Auth0 esté incluido en headers
- Revisar que el backend tenga CORS configurado
- Confirmar que el usuario esté autenticado

### **Suscripción no se actualiza después del pago**
**Solución:**
- Verificar que el webhook de Mercado Pago esté activo
- Usar `refetch()` en la página de pago exitoso
- Esperar 2-3 segundos después del pago

### **Contador de sesiones no funciona**
**Solución:**
- Verificar que el endpoint `GET /api/usuario/:userId` devuelva el array `sesiones`
- Confirmar que `sessionsUsed = usuario.sesiones.length`

---

## 📚 RECURSOS

### **Componentes Creados**
- `CreateSessionButton` - Botón completo con protección
- `PricingCard` - Card de plan individual
- `SubscriptionBadge` - Badge de plan actual
- `UpgradePrompt` - Prompt de actualización (banner/card/modal)
- `SessionCounter` - Contador de sesiones
- `PremiumGuard` - Guard para funciones premium
- `PaymentHistory` - Historial de pagos

### **Hooks**
- `useSubscription(userId)` - Estado de suscripción
- `usePremiumFeature()` - Verificar acceso premium

### **Páginas**
- `/planes` - Página de planes
- `/pago-exitoso` - Confirmación exitosa
- `/pago-fallido` - Error de pago
- `/pago-pendiente` - Pago en proceso

### **Servicios**
- `crearPreferenciaPago(data)` - Crear checkout
- `obtenerHistorialPagos(userId)` - Historial

---

## 🎯 RESULTADO FINAL ESPERADO

Después de completar la integración:

✅ Usuario Free puede crear 2 sesiones  
✅ Después de 2 sesiones, ve prompt de upgrade  
✅ Puede navegar a `/planes` y ver los 3 planes  
✅ Puede suscribirse a Premium (mensual/anual)  
✅ Redirección a Mercado Pago funciona  
✅ Después del pago, vuelve a `/pago-exitoso`  
✅ Suscripción se actualiza automáticamente (webhook)  
✅ Usuario Premium puede crear sesiones ilimitadas  
✅ Badge muestra plan correcto  
✅ Funciones premium están protegidas  

---

**¡Sistema listo para producción!** 🚀
