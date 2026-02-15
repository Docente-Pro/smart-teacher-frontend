# Backend Requirements para Login Personalizado

## 🎯 Objetivo

El backend debe actuar como intermediario entre el frontend y Auth0, manejando la autenticación de forma segura sin exponer credenciales sensibles.

## 📋 Endpoints Requeridos

### 1. POST /api/auth/login

**Descripción**: Autentica al usuario con Auth0 y devuelve los tokens.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Implementación Backend (Node.js/Express ejemplo)**:
```javascript
const axios = require('axios');

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Llamar a Auth0 Resource Owner Password Grant
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      username: email,
      password: password,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET, // ⚠️ NUNCA en frontend
      realm: 'Username-Password-Authentication',
      scope: 'openid profile email offline_access',
      audience: process.env.AUTH0_AUDIENCE,
    });

    const tokens = response.data;

    // Opcional: Guardar refresh token en httpOnly cookie
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
    });

    // Devolver access_token e id_token al frontend
    res.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    });

  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    
    // Mapear errores de Auth0 a mensajes amigables
    const errorMessage = error.response?.data?.error_description || 'Error al iniciar sesión';
    
    res.status(401).json({
      error: 'authentication_failed',
      message: errorMessage,
    });
  }
});
```

**Response Success (200)**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

**Response Error (401)**:
```json
{
  "error": "authentication_failed",
  "message": "Wrong email or password"
}
```

---

### 2. POST /api/auth/logout

**Descripción**: Invalida el refresh token y cierra la sesión.

**Implementación**:
```javascript
app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      // Revocar refresh token en Auth0
      await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/revoke`, {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        token: refreshToken,
      });
    }

    // Limpiar cookie
    res.clearCookie('refresh_token');
    
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'logout_failed', message: 'Error al cerrar sesión' });
  }
});
```

**Response Success (200)**:
```json
{
  "success": true,
  "message": "Sesión cerrada exitosamente"
}
```

---

### 3. POST /api/auth/refresh

**Descripción**: Refresca el access token usando el refresh token almacenado.

**Implementación**:
```javascript
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'no_refresh_token', 
        message: 'No hay sesión activa' 
      });
    }

    // Obtener nuevo access token de Auth0
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'refresh_token',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      refresh_token: refreshToken,
    });

    const tokens = response.data;

    // Devolver nuevo access token
    res.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    });

  } catch (error) {
    console.error('Error al refrescar token:', error.response?.data || error.message);
    
    // Token inválido o expirado
    res.clearCookie('refresh_token');
    res.status(401).json({ 
      error: 'invalid_refresh_token', 
      message: 'Sesión expirada' 
    });
  }
});
```

**Response Success (200)**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMyJ9...",
  "expires_in": 86400,
  "token_type": "Bearer"
}
```

---

## 🔐 Variables de Entorno Backend

Crea un archivo `.env` en el backend:

```env
# Auth0 Configuration
AUTH0_DOMAIN=dev-uaweb6dupy6goyur.us.auth0.com
AUTH0_CLIENT_ID=8j76pZYvlriLAHVoHHgLGItEgfKCZb3D
AUTH0_CLIENT_SECRET=tu-client-secret-aqui  # ⚠️ OBTENER DE AUTH0 DASHBOARD
AUTH0_AUDIENCE=https://api.docente-pro.com

# Server
PORT=3000
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

---

## 🛡️ Seguridad

### 1. CORS Configuration

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true, // ⚠️ Importante para cookies
}));
```

### 2. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: 'Demasiados intentos de login, intenta nuevamente en 15 minutos',
});

app.post('/api/auth/login', loginLimiter, async (req, res) => {
  // ... código de login
});
```

### 3. Input Validation

```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // ... código de login
});
```

---

## 📊 Auth0 Dashboard Configuration

### 1. Enable Password Grant

1. Ir a **Applications** > [Tu App] > **Settings**
2. Ir a **Advanced Settings** > **Grant Types**
3. Activar:
   - ✅ Password
   - ✅ Refresh Token
4. Scroll arriba y hacer clic en **"Mark as first-party application"**
5. **Save Changes**

### 2. Get Client Secret

1. Ir a **Applications** > [Tu App] > **Settings**
2. Copiar **Client Secret**
3. Agregar al `.env` del backend

### 3. Configure API

1. Ir a **APIs** > Create API (si no existe)
2. **Identifier**: `https://api.docente-pro.com`
3. Copiar el identifier al `.env` como `AUTH0_AUDIENCE`

---

## 🧪 Testing

### Probar Login con cURL

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePassword123"
  }'
```

### Probar Refresh

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -b "refresh_token=tu-refresh-token-aqui"
```

### Probar Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Content-Type: application/json" \
  -b "refresh_token=tu-refresh-token-aqui"
```

---

## 📦 Dependencias Necesarias

```bash
npm install express axios cors express-rate-limit express-validator cookie-parser dotenv
```

O con pnpm:

```bash
pnpm add express axios cors express-rate-limit express-validator cookie-parser dotenv
```

---

## 🚀 Código Completo del Backend (Minimal)

```javascript
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
      username: email,
      password: password,
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      realm: 'Username-Password-Authentication',
      scope: 'openid profile email offline_access',
      audience: process.env.AUTH0_AUDIENCE,
    });

    const tokens = response.data;

    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    });

  } catch (error) {
    console.error('Error en login:', error.response?.data || error.message);
    res.status(401).json({
      error: 'authentication_failed',
      message: error.response?.data?.error_description || 'Error al iniciar sesión',
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (refreshToken) {
      await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/revoke`, {
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        token: refreshToken,
      });
    }

    res.clearCookie('refresh_token');
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });

  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ error: 'logout_failed', message: 'Error al cerrar sesión' });
  }
});

// Refresh endpoint
app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({ 
        error: 'no_refresh_token', 
        message: 'No hay sesión activa' 
      });
    }

    const response = await axios.post(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      grant_type: 'refresh_token',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      refresh_token: refreshToken,
    });

    const tokens = response.data;

    res.json({
      access_token: tokens.access_token,
      id_token: tokens.id_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
    });

  } catch (error) {
    console.error('Error al refrescar token:', error.response?.data || error.message);
    res.clearCookie('refresh_token');
    res.status(401).json({ 
      error: 'invalid_refresh_token', 
      message: 'Sesión expirada' 
    });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
```

---

## ✅ Checklist Backend

- [ ] Instalar dependencias: `express`, `axios`, `cors`, `cookie-parser`, `dotenv`
- [ ] Crear archivo `.env` con credenciales de Auth0
- [ ] Configurar CORS para permitir `http://localhost:5173`
- [ ] Implementar endpoint `POST /api/auth/login`
- [ ] Implementar endpoint `POST /api/auth/logout`
- [ ] Implementar endpoint `POST /api/auth/refresh`
- [ ] Habilitar Password Grant en Auth0 Dashboard
- [ ] Obtener Client Secret de Auth0
- [ ] Marcar aplicación como "First Party" en Auth0
- [ ] Agregar rate limiting para seguridad
- [ ] Probar con cURL o Postman
- [ ] Validar que frontend pueda llamar a los endpoints

---

**Fecha**: 4 de diciembre de 2025  
**Versión Backend**: Mínima funcional  
**Framework**: Express.js (adaptable a Nest.js, Fastify, etc.)
