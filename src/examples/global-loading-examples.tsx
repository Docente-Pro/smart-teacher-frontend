// ============================================
// EJEMPLOS DE USO - GLOBAL LOADING
// ============================================

import { useGlobalLoading } from "@/hooks/useGlobalLoading";
import { useLoadingStore } from "@/store/loading.store";
import { crearPreferenciaPago } from "@/services/pago.service";
import { toast } from "sonner";

// ============================================
// 1. USO BÁSICO EN COMPONENTE
// ============================================

function EjemploBasico() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const handleClick = async () => {
    showLoading("Procesando...");
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("¡Completado!");
    } finally {
      hideLoading();
    }
  };

  return <button onClick={handleClick}>Procesar</button>;
}

// ============================================
// 2. CARGA INICIAL DE PÁGINA
// ============================================

function Dashboard() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    const cargarDatos = async () => {
      showLoading("Cargando dashboard...");
      
      try {
        const response = await fetch("/api/dashboard");
        const data = await response.json();
        setDatos(data);
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        hideLoading();
      }
    };

    cargarDatos();
  }, []);

  return <div>{/* Tu contenido */}</div>;
}

// ============================================
// 3. FORMULARIO CON VALIDACIÓN
// ============================================

function FormularioEjemplo() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const onSubmit = async (data: FormData) => {
    showLoading("Guardando datos...");
    
    try {
      await api.guardar(data);
      toast.success("Datos guardados exitosamente");
      navigate("/success");
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      hideLoading();
    }
  };

  return <form onSubmit={handleSubmit(onSubmit)}>{/* Campos */}</form>;
}

// ============================================
// 4. PROCESO DE PAGO (MANTIENE LOADING HASTA REDIRECCIÓN)
// ============================================

function BotonPagar() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const userId = useAuthStore((state) => state.user?.id);

  const handlePagar = async (planId: string) => {
    showLoading("Procesando pago con Mercado Pago...");
    
    try {
      const { checkoutUrl } = await crearPreferenciaPago(userId!, planId);
      
      // NO llamar hideLoading aquí - se mantiene hasta la redirección
      window.location.href = checkoutUrl;
    } catch (error) {
      hideLoading();
      toast.error("Error al procesar el pago");
    }
  };

  return (
    <button onClick={() => handlePagar("premium_mensual")}>
      Pagar S/29.90
    </button>
  );
}

// ============================================
// 5. MÚLTIPLES REQUESTS EN PARALELO
// ============================================

function CargaParalela() {
  const { showLoading, hideLoading } = useGlobalLoading();

  useEffect(() => {
    const cargarTodo = async () => {
      showLoading("Cargando información completa...");
      
      try {
        const [areas, competencias, criterios] = await Promise.all([
          fetch("/api/areas").then(r => r.json()),
          fetch("/api/competencias").then(r => r.json()),
          fetch("/api/criterios").then(r => r.json()),
        ]);
        
        // Procesar datos...
      } finally {
        hideLoading();
      }
    };

    cargarTodo();
  }, []);

  return <div>{/* Contenido */}</div>;
}

// ============================================
// 6. NAVEGACIÓN CON PRE-CARGA
// ============================================

function NavegacionEjemplo() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const navigate = useNavigate();

  const irACompetencias = async () => {
    showLoading("Cargando competencias...");
    
    try {
      // Pre-cargar datos antes de navegar
      await fetch("/api/competencias");
      
      navigate("/competencias");
    } finally {
      hideLoading();
    }
  };

  return <button onClick={irACompetencias}>Ver Competencias</button>;
}

// ============================================
// 7. USO EN SERVICIO/API (DESDE STORE DIRECTAMENTE)
// ============================================

// services/usuarios.service.ts
export const obtenerUsuarios = async () => {
  // Acceder al store sin hooks (fuera de componentes)
  const { showLoading, hideLoading } = useLoadingStore.getState();
  
  showLoading("Obteniendo usuarios...");
  
  try {
    const response = await instance.get("/usuarios");
    return response.data;
  } finally {
    hideLoading();
  }
};

// ============================================
// 8. ACTUALIZACIÓN DE MENSAJE DURANTE PROCESO
// ============================================

function ProcesoMultipaso() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const procesarTodo = async () => {
    try {
      showLoading("Paso 1: Validando datos...");
      await validarDatos();
      
      showLoading("Paso 2: Procesando archivos...");
      await procesarArchivos();
      
      showLoading("Paso 3: Guardando en servidor...");
      await guardarEnServidor();
      
      toast.success("¡Proceso completado!");
    } catch (error) {
      toast.error("Error en el proceso");
    } finally {
      hideLoading();
    }
  };

  return <button onClick={procesarTodo}>Iniciar Proceso</button>;
}

// ============================================
// 9. CON TRY-CATCH-FINALLY PATTERN
// ============================================

function PatronRecomendado() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const ejecutar = async () => {
    showLoading("Procesando solicitud...");
    
    try {
      const resultado = await apiCall();
      
      if (resultado.success) {
        toast.success("¡Éxito!");
        return resultado.data;
      } else {
        throw new Error(resultado.error);
      }
    } catch (error) {
      toast.error(error.message || "Error al procesar");
      console.error(error);
    } finally {
      // SIEMPRE se ejecuta, incluso si hay error o return
      hideLoading();
    }
  };

  return <button onClick={ejecutar}>Ejecutar</button>;
}

// ============================================
// 10. LOADING CONDICIONAL (SOLO SI TARDA)
// ============================================

function LoadingCondicional() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const fetchConTimeout = async () => {
    let timeoutId: NodeJS.Timeout;
    
    // Solo mostrar loading si tarda más de 500ms
    timeoutId = setTimeout(() => {
      showLoading("Esto está tardando un poco...");
    }, 500);
    
    try {
      const data = await fetchData();
      return data;
    } finally {
      clearTimeout(timeoutId);
      hideLoading();
    }
  };

  return <button onClick={fetchConTimeout}>Cargar</button>;
}

// ============================================
// 11. INTEGRACIÓN CON REACT QUERY
// ============================================

import { useQuery } from "@tanstack/react-query";

function ConReactQuery() {
  const { showLoading, hideLoading } = useGlobalLoading();

  const { data, isLoading } = useQuery({
    queryKey: ["usuarios"],
    queryFn: async () => {
      showLoading("Cargando usuarios...");
      try {
        const response = await fetch("/api/usuarios");
        return response.json();
      } finally {
        hideLoading();
      }
    },
  });

  return <div>{/* Renderizar data */}</div>;
}

// ============================================
// 12. LOADING EN LOGIN/AUTH
// ============================================

function LoginForm() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const { login } = useAuthStore();

  const handleLogin = async (credentials: LoginData) => {
    showLoading("Iniciando sesión...");
    
    try {
      await login(credentials);
      
      // El loading se mantiene mientras se valida y redirige
      showLoading("Validando perfil...");
      
      // PostLoginValidator tomará el control
    } catch (error) {
      hideLoading();
      toast.error("Credenciales inválidas");
    }
  };

  return <form onSubmit={handleSubmit(handleLogin)}>{/* Campos */}</form>;
}

// ============================================
// 13. LOADING EN CREAR SESIÓN (CUESTIONARIO)
// ============================================

function CuestionarioSesion() {
  const { showLoading, hideLoading } = useGlobalLoading();
  const navigate = useNavigate();

  const onFinalizarCuestionario = async (data: CuestionarioData) => {
    showLoading("Generando plan de sesión con IA...");
    
    try {
      const sesion = await crearSesion(data);
      
      toast.success("Sesión creada exitosamente");
      navigate(`/sesiones/${sesion.id}`);
    } catch (error) {
      hideLoading();
      toast.error("Error al crear sesión");
    }
    // El loading se mantiene hasta que navegue a la nueva página
  };

  return <Stepper onComplete={onFinalizarCuestionario} />;
}

export {
  EjemploBasico,
  Dashboard,
  FormularioEjemplo,
  BotonPagar,
  CargaParalela,
  NavegacionEjemplo,
  ProcesoMultipaso,
  PatronRecomendado,
  LoadingCondicional,
  ConReactQuery,
  LoginForm,
  CuestionarioSesion,
};
