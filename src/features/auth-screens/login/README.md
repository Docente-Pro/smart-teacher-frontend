# Pantalla de Login Personalizada

## 📁 Estructura de Archivos

```
src/features/auth-screens/login/
├── LoginPage.tsx                    # Página principal de login
├── components/
│   ├── LoginForm.tsx               # Formulario de login con validación
│   └── SocialLogin.tsx             # Botones de login social
├── constants/
│   └── loginConstants.ts           # Constantes y mensajes
├── interfaces/
│   └── ILogin.ts                   # Interfaces TypeScript
├── services/
│   └── (próximamente)
└── store/
    └── loginStore.ts               # Estado global con Zustand
```

## 🎨 Características

### Diseño
- **Split-screen layout**: Formulario a la izquierda, imagen/branding a la derecha
- **Gradiente purple-pink**: Fondo degradado moderno en el lado derecho
- **Responsive**: Se oculta el lado derecho en pantallas pequeñas (< lg)
- **Dark mode**: Soporte completo para modo oscuro

### Funcionalidades
- ✅ Validación de email con regex
- ✅ Validación de contraseña (mínimo 6 caracteres)
- ✅ Mostrar/ocultar contraseña con toggle
- ✅ Checkbox "Recordarme"
- ✅ Link "¿Olvidaste tu contraseña?"
- ✅ Login social (Google, Facebook)
- ✅ Integración con Auth0
- ✅ Redirección automática si ya está autenticado
- ✅ Estado global con Zustand

## 🔧 Uso

### Acceso a la Página
```tsx
// Ruta configurada en src/routes/index.routes.tsx
// URL: http://localhost:5173/login
```

### Flujo de Autenticación

1. **Usuario no autenticado**: Muestra formulario de login
2. **Usuario ingresa credenciales**: Validación en tiempo real
3. **Submit**: Se conecta con Auth0
4. **Auth0 autentica**: Redirige según el rol
   - Usuario premium → `/dashboard`
   - Usuario free → `/` (landing page)

### Estado Global (Zustand)

```tsx
import { useLoginStore } from '@/features/auth-screens/login/store/loginStore';

function MyComponent() {
  const { credentials, isLoading, setCredentials, setLoading, setError } = useLoginStore();
  
  // Uso del estado
  setCredentials({ email: 'test@example.com' });
  setLoading(true);
  setError('Error al iniciar sesión');
}
```

## 📝 Validaciones

### Email
- **Requerido**: "El correo electrónico es obligatorio"
- **Formato inválido**: "Ingresa un correo electrónico válido"
- **Regex**: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

### Contraseña
- **Requerida**: "La contraseña es obligatoria"
- **Mínimo 6 caracteres**: "La contraseña debe tener al menos 6 caracteres"

## 🔐 Integración con Auth0

### Login con Email/Contraseña
```tsx
await loginWithRedirect({
  authorizationParams: {
    login_hint: credentials.email,
  },
});
```

### Login Social
```tsx
await loginWithRedirect({
  authorizationParams: {
    connection: 'google-oauth2', // o 'facebook', 'apple'
  },
});
```

## 🎯 Próximas Mejoras

- [ ] Crear página "Olvidé mi contraseña"
- [ ] Agregar rate limiting para intentos fallidos
- [ ] Implementar CAPTCHA después de 3 intentos fallidos
- [ ] Agregar animaciones de transición
- [ ] Mejorar mensajes de error específicos de Auth0
- [ ] Agregar login con Apple
- [ ] Implementar 2FA (autenticación de dos factores)

## 🚀 Dependencias Nuevas

```json
{
  "zustand": "^4.x.x"  // State management
}
```

## 📱 Responsive Breakpoints

- **Mobile (< lg)**: Solo formulario, sin imagen
- **Desktop (>= lg)**: Split-screen con formulario e imagen

## 🎨 Paleta de Colores

- **Gradiente primario**: `from-purple-600 via-purple-700 to-pink-600`
- **Botón CTA**: `from-blue-600 to-purple-600`
- **Texto principal**: `gray-900` (dark: `white`)
- **Texto secundario**: `gray-600` (dark: `gray-400`)

## 📄 Licencia

Este componente es parte del proyecto DocentePro.
