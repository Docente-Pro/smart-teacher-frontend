# Auth Store - Guía de Uso

## 📦 Estructura Mejorada

### Interfaces Separadas (`src/interfaces/IAuth.ts`)

```typescript
// Tipos básicos
export type PlanType = 'free' | 'premium_mensual' | 'premium_anual';

// Datos del usuario desde backend
export interface UserData { ... }

// JWT decodificado
export interface JWTPayload { ... }

// Usuario enriquecido (JWT + Backend)
export interface EnrichedUser extends JWTPayload { ... }

// Request/Response interfaces
export interface LoginRequest { ... }
export interface LoginResponse { ... }
export interface RefreshTokenRequest { ... }
export interface RefreshTokenResponse { ... }
```

### Utilidades Reutilizables

```typescript
import { 
  isPremiumUser,
  hasCompleteProfile,
  canCreateSession,
  getRemainingSessions,
  getPlanDisplayName 
} from '@/interfaces/IAuth';

// En cualquier componente
const isPremium = isPremiumUser(user);
const canCreate = canCreateSession(user);
const sessions = getRemainingSessions(user);
const planName = getPlanDisplayName(user?.plan);
```

## 🎯 Uso del Store

### 1. Importar el Store

```typescript
import { useAuthStore } from '@/store/auth.store';
```

### 2. Usar en Componentes

```typescript
function MyComponent() {
  // Obtener estado
  const { user, isAuthenticated, isLoading } = useAuthStore();
  
  // Obtener acciones
  const { setTokens, updateUser, clearAuth, setLoading } = useAuthStore();
  
  // Selectores específicos (evita re-renders innecesarios)
  const user = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);
  
  return (
    <div>
      <p>Usuario: {user?.name}</p>
      <p>Plan: {getPlanDisplayName(user?.plan)}</p>
      <p>Sesiones restantes: {getRemainingSessions(user)}</p>
    </div>
  );
}
```

### 3. Usar con Utilidades

```typescript
import { useAuthStore } from '@/store/auth.store';
import { isPremiumUser, canCreateSession } from '@/interfaces/IAuth';

function Dashboard() {
  const user = useAuthStore(state => state.user);
  
  const isPremium = isPremiumUser(user);
  const canCreate = canCreateSession(user);
  
  return (
    <div>
      {isPremium && <PremiumFeatures />}
      {canCreate ? (
        <CreateSessionButton />
      ) : (
        <UpgradePrompt />
      )}
    </div>
  );
}
```

### 4. Actualizar Usuario (sin re-login)

```typescript
import { useAuthStore } from '@/store/auth.store';

function updateProfile() {
  const updateUser = useAuthStore(state => state.updateUser);
  
  // Después de completar el perfil en el backend
  updateUser({ 
    perfilCompleto: true,
    problematicaCompleta: true 
  });
}
```

### 5. Login

```typescript
import { useAuthStore } from '@/store/auth.store';
import { login } from '@/services/auth.service';

async function handleLogin(email: string, password: string) {
  const { setTokens, setLoading } = useAuthStore.getState();
  
  setLoading(true);
  try {
    const response = await login({ email, password });
    setTokens(response); // Guarda tokens y datos del usuario
    navigate('/dashboard');
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
}
```

### 6. Logout

```typescript
import { useAuthStore } from '@/store/auth.store';

function handleLogout() {
  const clearAuth = useAuthStore(state => state.clearAuth);
  
  clearAuth(); // Limpia todo el estado
  navigate('/login');
}
```

### 7. Verificar Token Expirado

```typescript
import { useAuthStore, selectIsTokenExpired } from '@/store/auth.store';

function useTokenCheck() {
  const isExpired = useAuthStore(selectIsTokenExpired);
  
  useEffect(() => {
    if (isExpired) {
      // Refrescar token o hacer logout
      refreshToken();
    }
  }, [isExpired]);
}
```

## 🏗️ Arquitectura

```
src/
├── interfaces/
│   ├── IAuth.ts           # ✅ Interfaces + Utilidades
│   ├── index.ts           # ✅ Barrel export
│   └── ...otras interfaces
├── store/
│   └── auth.store.ts      # ✅ Store limpio con tipos importados
└── hooks/
    └── useAuth0.tsx       # Hook personalizado que usa el store
```

## ✨ Ventajas de esta Estructura

1. **Separación de responsabilidades**: Interfaces en un lugar, lógica en otro
2. **Reutilización**: Las utilidades se pueden usar en cualquier lugar
3. **Type-safety**: Todo tipado con TypeScript
4. **Mantenibilidad**: Fácil de encontrar y modificar
5. **Testing**: Las utilidades son funciones puras, fáciles de testear
6. **Performance**: Selectores evitan re-renders innecesarios

## 📝 Ejemplos Reales

### Verificar si puede crear sesión

```typescript
import { useAuthStore } from '@/store/auth.store';
import { canCreateSession } from '@/interfaces/IAuth';

function CreateSessionButton() {
  const user = useAuthStore(state => state.user);
  
  if (!canCreateSession(user)) {
    return <UpgradeToPremium />;
  }
  
  return <button onClick={handleCreate}>Crear Sesión</button>;
}
```

### Mostrar plan del usuario

```typescript
import { useAuthStore } from '@/store/auth.store';
import { getPlanDisplayName } from '@/interfaces/IAuth';

function UserProfile() {
  const user = useAuthStore(state => state.user);
  
  return (
    <div>
      <h2>{user?.name}</h2>
      <Badge>{getPlanDisplayName(user?.plan)}</Badge>
    </div>
  );
}
```

### Proteger rutas premium

```typescript
import { useAuthStore } from '@/store/auth.store';
import { isPremiumUser } from '@/interfaces/IAuth';

function PremiumRoute() {
  const user = useAuthStore(state => state.user);
  
  if (!isPremiumUser(user)) {
    return <Navigate to="/planes" />;
  }
  
  return <PremiumContent />;
}
```
