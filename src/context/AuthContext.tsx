import {
  createContext,
  ReactNode,
  useReducer,
  Dispatch,
  useEffect,
} from "react";
import {
  initialState,
  UsuarioReducer,
  UsuarioActions,
  UsuarioState,
} from "../reducers/usuario-reducer";
import { AUTENTICAR_USUARIO, OBTENER_USUARIO } from "../graphql/usuario";
import { ApolloError, useLazyQuery, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";

// Definir el tipo del contexto
interface AuthContextType {
  state: UsuarioState;
  dispatch: Dispatch<UsuarioActions>;
  authUsuario: (correo: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
}

// Crear el contexto con un valor inicial tipado correctamente
export const AuthContext = createContext<AuthContextType | null>(null);

// Definir las props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Crear el UsuarioProvider como un componente funcional tipado
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(UsuarioReducer, initialState);
  const [autenticarUsuario] = useMutation(AUTENTICAR_USUARIO, {
    errorPolicy: "all", // Asegura que los errores de GraphQL se manejen
  });
  const [obtenerUsuario, { data, error }] = useLazyQuery(OBTENER_USUARIO);

  const navigation = useNavigate()

  const authUsuario = async (correo: string, password: string) => {
    try {
      const { data, errors } = await autenticarUsuario({
        variables: { input: { correo, password } },
      });
  
      // Verifica si hay errores de GraphQL
      if (errors && errors.length > 0) {
        // Manejo de los errores de GraphQL directamente en la respuesta
        errors.forEach((graphQLError) => {
          console.error("GraphQL Error:", graphQLError.message);
          
          // Pasar el error al estado con dispatch
          dispatch({
            type: "SET_ERROR",
            payload: { message: graphQLError.message, success: false },
          });
        });
        return; // Salir del bloque si hubo errores
      }
  
      // Verificar si la mutación devolvió datos válidos
      if (data?.autenticarUsuario) {
        const { usuario, token } = data.autenticarUsuario;
  
        // Guardar el token en localStorage
        localStorage.setItem("authToken", token);
  
        // Despachar el usuario autenticado
        dispatch({
          type: "SET_USUARIO",
          payload: usuario,
        });
  
        // Limpiar errores
        dispatch({ type: "CLEAR_ERROR" });
  
        console.log(data);
        console.log("Sesión iniciada");
      }
    } catch (err) {
      console.error("Error capturado en el catch:", err);
  
      if (err instanceof ApolloError) {
        // Manejo de los errores de GraphQL
        if (err.graphQLErrors.length > 0) {
          err.graphQLErrors.forEach((graphQLError) => {
            console.error("GraphQL Error:", graphQLError.message);
            
            // Pasar el error al estado con dispatch
            dispatch({
              type: "SET_ERROR",
              payload: { message: graphQLError.message, success: false },
            });
          });
        }
  
        // Manejo de los errores de red
        if (err.networkError) {
          console.error("Network Error:", err.networkError.message);
          
          // Pasar el error de red al estado con dispatch
          dispatch({
            type: "SET_ERROR",
            payload: { message: "Error de red. Inténtalo de nuevo más tarde.", success: false },
          });
        }
      } else {
        // Otro tipo de error (desconocido)
        console.error("Error desconocido:", err);
        
        dispatch({
          type: "SET_ERROR",
          payload: { message: "Ocurrió un error inesperado.", success: false },
        });
      }
    }
  };  

  useEffect(() => {
    const autenticarConToken = async () => {
      const token = await localStorage.getItem("authToken");
      if (token) {
        obtenerUsuario();
      }else{
        navigation('/')
      }
    };

    autenticarConToken();
  }, [obtenerUsuario]);

  useEffect(() => {
    const handleData = async () => {
      if (data) {
        dispatch({
          type: "SET_USUARIO",
          payload: data.obtenerUsuario,
        });
        const { rol } = data.obtenerUsuario;

        console.log(rol);
      } else if (error) {
        console.log("Error en useEffect:", error);
      }
    };

    handleData();
  }, [data, error]);

  const cerrarSesion = async () => {
    await localStorage.removeItem("authToken");

    dispatch({
      type: "CLEAR_USUARIO",
    });

    console.log("Sesión cerrada");
  };

  return (
    <AuthContext.Provider
      value={{ state, dispatch, authUsuario, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
};
