# 🔐 Arquitectura de Autenticación Limpia

## 📋 Resumen

Se reconstruyó completamente la arquitectura de autenticación para eliminar loops infinitos y simplificar el flujo. La nueva arquitectura reduce el código de ~250 líneas a ~150 líneas y elimina validaciones redundantes.

---

## 🏗️ Arquitectura Nueva (Simple)

### Flujo de Autenticación

```
Usuario → Login → Auth0 → useAuthFlow → Store → ProtectedRoute → Dashboard
```

### Componentes Principales

#### 1. **useAuthFlow** (`src/hooks/useAuthFlow.ts`)
- **Propósito**: Hook unificado que maneja AMBOS flujos de autenticación
- **Líneas**: 90
- **Responsabilidades**:
  - Detecta cuando Auth0 está autenticado
  - Busca/crea usuario en backend
  - Sincroniza estado en el store
  - **UNA SOLA VEZ** por sesión

```typescript
useEffect(() => {
  if (isAuthenticated && auth0User && !user) {
    // 1. Buscar usuario en BD
    // 2. Si no existe, crear
    // 3. Guardar en store
  }
}, [isAuthenticated, auth0User]);
```

#### 2. **ProtectedRoute** (`src/components/ProtectedRoute.tsx`)
- **Propósito**: Componente único de protección de rutas
- **Líneas**: 60
- **Validaciones en orden**:
  1. ❌ No autenticado → `/login`
  2. ⚠️ Perfil incompleto → `/onboarding`
  3. 📦 Free sin sesiones → `/planes`
  4. ⏰ Premium vencido → `/suscripcion-vencida`
  5. ✅ Todo OK → Mostrar componente

```typescript
useEffect(() => {
  if (!isAuthenticated) return navigate("/login");
  if (!user?.perfilCompleto) return navigate("/onboarding");
  if (user?.plan === "free" && user?.cantidadSesionesRestantes === 0) {
    return navigate("/planes");
  }
  if (user?.plan !== "free" && !user?.suscripcionActiva) {
    return navigate("/suscripcion-vencida");
  }
}, [isAuthenticated, user]);
```

#### 3. **Dashboard** (`src/pages/Dashboard.tsx`)
- **Propósito**: Dashboard principal
- **Responsabilidades**:
  - ✅ Mostrar datos del usuario
  - ✅ Cargar información del dashboard
  - ❌ ~~NO valida perfil~~ (lo hace ProtectedRoute)
  - ❌ ~~NO valida suscripción~~ (lo hace ProtectedRoute)

```typescript
// ANTES (complejo, duplicado)
useEffect(() => {
  // Validar auth0User
  // Validar perfil
  // Validar suscripción
  // Cargar datos
}, [auth0User]);

// AHORA (simple, único propósito)
useEffect(() => {
  // Solo cargar datos
}, [user]);
```

---

## 🔄 Comparación: Antes vs Ahora

### Arquitectura Anterior (Compleja)

```
RouteProtector (40 líneas)
  └─ PostLoginValidator (80 líneas)
      └─ Dashboard
          └─ useEffect (validaciones duplicadas)

useSocialAuthCallback (160 líneas)
useSessionRestore (70 líneas)
```

**Problemas**:
- ❌ Validaciones duplicadas en 3 lugares
- ❌ Loops infinitos Dashboard ↔ Onboarding
- ❌ Confusión entre hooks (competencia)
- ❌ 3 archivos diferentes para protección
- ❌ ~250 líneas de código complejo

### Arquitectura Nueva (Simple)

```
ProtectedRoute (60 líneas)
  └─ Dashboard (sin validaciones)

useAuthFlow (90 líneas)
useSessionRestore (70 líneas)
```

**Beneficios**:
- ✅ Validaciones en UN solo lugar
- ✅ Sin loops (flujo lineal)
- ✅ Hooks con responsabilidades claras
- ✅ 1 archivo para protección
- ✅ ~150 líneas de código claro

---

## 📁 Archivos Clave

### Nuevos (Creados)
- ✅ `src/hooks/useAuthFlow.ts` - Hook unificado de autenticación
- ✅ `src/components/ProtectedRoute.tsx` - Protección única de rutas

### Modificados
- ✅ `src/main.tsx` - Usa useAuthFlow en lugar de useSocialAuthCallback
- ✅ `src/routes/index.routes.tsx` - Todas las rutas usan ProtectedRoute
- ✅ `src/pages/Dashboard.tsx` - Simplificado, sin validaciones

### Eliminados
- ❌ `src/hooks/useSocialAuthCallback.ts` (160 líneas)
- ❌ `src/auth/RouteProtector.tsx` (40 líneas)
- ❌ `src/auth/PostLoginValidator.tsx` (80 líneas)

---

## 🧪 Pruebas Recomendadas

### 1. Login Email/Password
```
1. Ir a /login
2. Ingresar email/password
3. ✅ Debe ir a /dashboard directamente (sin loops)
4. ✅ No debe mostrar logs de validación duplicados
```

### 2. Login Social (Google)
```
1. Ir a /login
2. Click "Continuar con Google"
3. ✅ Debe ir a /dashboard directamente (sin loops)
4. ✅ No debe pasar por /onboarding múltiples veces
```

### 3. Perfil Incompleto
```
1. Login con usuario sin perfilCompleto
2. ✅ Debe redirigir a /onboarding UNA VEZ
3. ✅ No debe crear loop
```

### 4. Usuario Free sin Sesiones
```
1. Login con plan: "free", cantidadSesionesRestantes: 0
2. ✅ Debe redirigir a /planes
```

### 5. Premium Vencido
```
1. Login con plan: "premium", suscripcionActiva: false
2. ✅ Debe redirigir a /suscripcion-vencida
```

### 6. Logout
```
1. Desde Dashboard, click en botón de salir
2. ✅ Debe limpiar store y volver a /login
3. ✅ localStorage debe quedar vacío
```

---

## 🔧 Store: auth.store.ts

### Estado Unificado
```typescript
interface AuthState {
  // Usuario unificado (backend + Auth0)
  user: {
    id: string;
    email: string;
    name: string;
    perfilCompleto: boolean;
    plan: "free" | "premium" | "empresa";
    suscripcionActiva: boolean;
    cantidadSesionesRestantes: number;
    // ... otros campos
  } | null;

  // Tokens
  accessToken: string | null;
  idToken: string | null;
  
  // Métodos
  setTokens: (accessToken, idToken) => void;
  setUser: (user) => void;
  logout: () => void;
}
```

### Flujo de Datos
```
Auth0 → useAuthFlow → setUser(backend) → Store → ProtectedRoute → Dashboard
```

---

## 📊 Logs Esperados (Sin Loops)

### Login Exitoso
```
✅ useAuthFlow: Usuario autenticado
✅ useAuthFlow: Buscando usuario en backend: email@example.com
✅ useAuthFlow: Usuario encontrado en BD
✅ useAuthFlow: Usuario guardado en store
✅ ProtectedRoute: Usuario válido, mostrando Dashboard
✅ Dashboard: Cargando datos...
```

### Login con Perfil Incompleto
```
✅ useAuthFlow: Usuario autenticado
✅ useAuthFlow: Usuario encontrado: perfilCompleto=false
✅ ProtectedRoute: Perfil incompleto, redirigiendo a /onboarding
```

### Logs NO deseados (indicarían bug)
```
❌ PostLoginValidator: ... (este componente ya no existe)
❌ RouteProtector: ... (este componente ya no existe)
❌ Múltiples "Perfil incompleto" (indicaría loop)
❌ Navegación en throttle (demasiados redirects)
```

---

## 🚀 Siguiente Paso

1. **Limpiar localStorage**:
   ```javascript
   localStorage.clear();
   ```

2. **Reiniciar aplicación**:
   ```bash
   npm run dev
   ```

3. **Probar login tradicional**:
   - Email/Password → Dashboard (sin loops)

4. **Probar login social**:
   - Google → Dashboard (sin loops)

5. **Verificar logs en consola**:
   - No debe haber mensajes duplicados
   - No debe haber "throttled navigation"

---

## ✨ Mejoras Implementadas

1. **Código más limpio**: De 250 → 150 líneas (-40%)
2. **Sin duplicación**: Validaciones en UN solo lugar
3. **Sin loops**: Flujo lineal y predecible
4. **Mejor separación**: useAuthFlow (init) vs ProtectedRoute (validation)
5. **Debugging más fácil**: Logs claros sin ruido
6. **Mantenimiento más simple**: 2 archivos vs 5 archivos
7. **Menos bugs**: Sin competencia entre hooks

---

## 🎯 Responsabilidades Claras

| Componente | Responsabilidad | Ejecuta |
|------------|-----------------|---------|
| `useSessionRestore` | Restaurar sesión desde localStorage | Una vez al inicio |
| `useAuthFlow` | Detectar auth + crear/buscar usuario | Una vez por login |
| `ProtectedRoute` | Validar acceso a rutas protegidas | Cada navegación |
| `Dashboard` | Mostrar datos del dashboard | Después de validación |
| `auth.store` | Guardar estado global | Siempre disponible |

---

**Última actualización**: ${new Date().toLocaleDateString()}
