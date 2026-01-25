import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router';

interface User {
  email: string;
  name: string;
  roles: string[];
  sub: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para decodificar JWT
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const idToken = localStorage.getItem('auth0_id_token');
    const expiresAt = localStorage.getItem('auth0_expires_at');

    if (!idToken || !expiresAt) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // Verificar expiración
    if (Date.now() > parseInt(expiresAt)) {
      logout();
      return;
    }

    // Decodificar token
    const decoded = parseJwt(idToken);
    if (!decoded) {
      logout();
      return;
    }

    // Extraer información del usuario
    setUser({
      email: decoded.email || '',
      name: decoded.name || decoded.email || '',
      roles: decoded['https://docente-pro.com/roles'] || [],
      sub: decoded.sub || '',
    });

    setIsLoading(false);
  };

  const login = async (_email: string, _password: string) => {
    // Esta función se implementará en el LoginForm
    // Solo la dejamos aquí para consistencia con la interfaz
    throw new Error('Use loginWithPassword from auth0.service');
  };

  const logout = () => {
    localStorage.removeItem('auth0_id_token');
    localStorage.removeItem('auth0_access_token');
    localStorage.removeItem('auth0_expires_at');
    setUser(null);
    navigate('/login');
  };

  const getAccessToken = (): string | null => {
    const token = localStorage.getItem('auth0_access_token');
    const expiresAt = localStorage.getItem('auth0_expires_at');

    if (!token || !expiresAt) return null;

    if (Date.now() > parseInt(expiresAt)) {
      logout();
      return null;
    }

    return token;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
