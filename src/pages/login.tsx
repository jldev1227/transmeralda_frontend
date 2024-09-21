import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Alerta from "../components/Alerta";
import useAuth from "../hooks/useAuth";
import { Button } from "@nextui-org/button";

export default function Login() {

  const [correo, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { state, dispatch, authUsuario } = useAuth();

  const handleSubmit = async (e : any) => {
    e.preventDefault();

    if ([correo, password].includes("")) {
      dispatch({ type: "SET_ERROR", payload: {message: 'Todos los campos son obligatorios', success: false} });
      return;
    }

    dispatch({ type: "CLEAR_ERROR"});

    await authUsuario(correo, password)
  };

    // Redirigir si el usuario ya está autenticado
    if (state.isAuthenticated) {
      return <Navigate to="/dashboard" />;
    }

  return (
    <>
      <h1 className="text-center text-green-700 font-black text-6xl capitalize">
        Inicia sesión y administra{" "}
        <span className="text-slate-600">Transmeralda SAS</span>
      </h1>

      <form
        onSubmit={handleSubmit}
        className="my-10 bg-white shadow-200 p-10 py-5 rounded-md"
      >
        {state.alerta && <Alerta alerta={state.alerta} />}
        <div className="my-5">
          <label
            htmlFor="correo"
            className="uppercase text-gray-600 block text-sm font-bold"
          >
            correo
          </label>
          <input
            type="text"
            id="correo"
            placeholder="Email de Registro"
            className="w-full border mt-3 p-3 rounded-xl bg-gray-50 focus:border-primary-100 outline-none"
            value={correo}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="my-5">
          <label
            htmlFor="password"
            className="uppercase text-gray-600 block text-sm font-bold"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Password de Registro"
            className="w-full border mt-3 p-3 rounded-xl bg-gray-50 focus:border-primary-100 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <Button
        type="submit"
        className="bg-green-700 text-white w-full p-6"
        >Ingresar</Button>
      </form>

      <nav className="lg:flex lg:justify-between">
        <Link
          className="block text-center my-5 text-slate-500 uppercase text-sm"
          to={"/registrar"}
        >
          ¿No tienes una cuenta? Regístrate
        </Link>
        <Link
          className="block text-center my-5 text-slate-500 uppercase text-sm"
          to={"/olvide-password"}
        >
          Olvide mi password
        </Link>
      </nav>
    </>
  );
}