import { Route, Routes } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "../apolloClient";

import Login from "@/pages/login";
import { LiquidacionProvider } from "./context/LiquidacionContext";
import { AuthProvider } from "./context/AuthContext";
import AuthLayout from "./layouts/authLayout";
import ProtectedRoutes from "./layouts/ProtectedLayout"; // Asume que tienes un layout para rutas protegidas
import Liquidador from "./pages/liquidador";
import DefaultLayout from "./layouts/default";
import Empresas from "./pages/empresas";

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas (sin LiquidacionProvider) */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Login />} />
          </Route>

          <Route element={<ProtectedRoutes />}>
            {/* Envuelve todas las rutas protegidas en DefaultLayout */}
            <Route element={<DefaultLayout />}>
              {/* Ruta para Dashboard */}
              <Route path="empresas" element={<Empresas />} />

              {/* Ruta para Liquidaciones con LiquidacionProvider */}
              <Route
                path="/liquidaciones"
                element={
                  <LiquidacionProvider>
                    <Liquidador />
                  </LiquidacionProvider>
                }
              />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;
