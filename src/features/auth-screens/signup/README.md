# Signup Feature

Este módulo contiene la funcionalidad completa de registro de usuarios siguiendo la arquitectura modular del proyecto.

## Estructura

```
signup/
├── SignupPage.tsx              # Página principal de registro
├── components/
│   ├── SignupForm.tsx          # Formulario de registro con validación
│   ├── SignupCallback.tsx      # Procesa el callback de Auth0 y crea usuario en BD
│   └── SocialLogin.tsx         # Login social (Google)
├── functions/
│   ├── index.ts                # Exportaciones centralizadas
│   ├── validateSignupForm.ts   # Validación del formulario
│   ├── pendingUserStorage.ts   # Gestión de localStorage
│   ├── createUser.ts           # Creación de usuario en BD
│   └── gradoFilters.ts         # Filtrado de grados por nivel
├── constants/
│   └── signupConstants.ts      # Constantes y validaciones
├── interfaces/
│   └── ISignup.ts              # Interfaces TypeScript
├── store/
│   └── signupStore.ts          # Estado global con Zustand
└── README.md                   # Documentación
```

## Flujo de Registro

1. Usuario completa el formulario con:
   - Nombre completo
   - Email
   - Institución educativa
   - Nivel educativo (Primaria/Secundaria)
   - Grado (filtrado por nivel)

2. Se validan todos los campos

3. **Se guardan los datos en localStorage** con timestamp

4. **Se redirige a Auth0** para crear la cuenta (screen_hint: "signup")

5. **Auth0 crea el usuario** y redirige a `/signup/callback`

6. **SignupCallback procesa el registro**:
   - Obtiene los datos de localStorage
   - Valida que no hayan expirado (30 minutos)
   - Crea el usuario en la base de datos con el ID de Auth0
   - Limpia localStorage
   - Redirige al dashboard

Este flujo garantiza que:
- ✅ El usuario se crea primero en Auth0 (fuente de verdad)
- ✅ El ID de Auth0 se guarda en la BD
- ✅ No hay discrepancias entre Auth0 y la BD
- ✅ Si algo falla, el usuario puede volver a intentar

## Componentes

### SignupPage
Página principal con layout dividido:
- Lado izquierdo: Formulario
- Lado derecho: Ilustración con gradiente azul

### SignupForm
Formulario completo con:
- Validación en tiempo real
- Carga dinámica de niveles y grados
- Filtrado de grados según nivel seleccionado
- Manejo de errores (email duplicado, etc.)
- Integración con Auth0

### SocialLogin
Login social con Google (Facebook removido)

## Funciones Modularizadas

### validateSignupForm
Valida todos los campos del formulario de registro según las reglas definidas en `signupConstants.ts`.

### pendingUserStorage
- `savePendingUserData`: Guarda los datos del formulario en localStorage con timestamp
- `getPendingUserData`: Recupera los datos guardados
- `clearPendingUserData`: Limpia los datos del localStorage
- `isPendingDataValid`: Valida si los datos no han expirado (30 min por defecto)

### createUser
- `createUserInDatabase`: Crea el usuario en la base de datos con el ID de Auth0
- `isDuplicateEmailError`: Verifica si un error es por email duplicado

### gradoFilters
- `filterGradosByNivel`: Filtra grados según el nivel educativo seleccionado
- `isGradoValidForNivel`: Verifica si un grado pertenece al nivel

## Estado (Zustand)

```typescript
{
  formData: {
    nombre: string
    email: string
    nombreInstitucion: string
    nivelId: number
    gradoId: number
  },
  isLoading: boolean,
  error: string | null,
  setFormData: (data) => void,
  setLoading: (loading) => void,
  setError: (error) => void,
  resetForm: () => void
}
```

## Validaciones

- **Nombre**: Mínimo 2 caracteres
- **Email**: Formato válido y único
- **Institución**: Mínimo 3 caracteres
- **Nivel**: Requerido
- **Grado**: Requerido y debe pertenecer al nivel seleccionado

## Endpoints Consumidos

- `GET /nivel` - Obtener niveles educativos
- `GET /grado` - Obtener todos los grados
- `POST /usuario` - Crear nuevo usuario

## Estilos

Utiliza el mismo sistema de diseño que LoginPage:
- Gradiente azul (blue-600 → blue-700 → blue-900)
- Glassmorphism con blurs cyan-400 y sky-400
- Botones con gradiente azul
- Dark mode compatible
