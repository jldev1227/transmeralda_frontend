import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth"; // Hook para acceder al contexto de autenticación

const ProtectedLayout = () => {
  const { state } = useAuth();

  // Verificar si el usuario está autenticado
  if (!state.isAuthenticated) {
    // Redirigir al login si no está autenticado
    return <Navigate to="/login" />;
  }

  // Si está autenticado, renderiza el contenido protegido
  return (
    <div>
      {/* Puedes agregar aquí un diseño común para todas las rutas protegidas, como un header o sidebar */}
      <header>
        {/* Header para rutas protegidas */}
      </header>

      {/* Renders the child components (the protected routes) */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default ProtectedLayout;
