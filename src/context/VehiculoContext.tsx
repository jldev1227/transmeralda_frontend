import {
  VehiculoState,
  VehiculoActions,
  VehiculoReducer,
  initialState,
} from "@/reducers/vehiculo-reducer";
import {
  createContext,
  ReactNode,
  useReducer,
  Dispatch,
  useEffect,
  useCallback,
} from "react";
import { OBTENER_VEHICULOS } from "@/graphql/vehiculo";
import { useQuery } from "@apollo/client";
import { FileDetailsVehiculos } from "@/hooks/useDropzone";
import axios from "axios";

// Definir el tipo del contexto
interface VehiculoContextType {
  state: VehiculoState;
  dispatch: Dispatch<VehiculoActions>;
  agregarVehiculo: (files: FileDetailsVehiculos[]) => void;
}

// Crear el contexto con un valor inicial tipado correctamente
export const VehiculoContext = createContext<VehiculoContextType | null>(null);

// Definir las props del provider
interface VehiculoProviderProps {
  children: ReactNode;
}

// Crear el UsuarioProvider como un componente funcional tipado
export const VehiculoProvider = ({ children }: VehiculoProviderProps) => {
  const [state, dispatch] = useReducer(VehiculoReducer, initialState);

  const {
    data: vehiculosData,
    loading: loadingVehiculos,
    error: errorQueryVehiculos,
  } = useQuery(OBTENER_VEHICULOS);

  const obtenerVehiculos = useCallback(() => {
    if (!loadingVehiculos && vehiculosData.obtenerVehiculos) {
      dispatch({
        type: "SET_VEHICULOS",
        payload: vehiculosData.obtenerVehiculos,
      });
    }
  }, [vehiculosData, loadingVehiculos, dispatch]);

  // Función para agregar una liquidación, optimizado con useCallback.

  // Función para crear un vehículo en la app web
  const agregarVehiculo = async (files: FileDetailsVehiculos[]) => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: true,
      })
      // Obtener el token desde el localStorage
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("Token no proporcionado");
      }

      // Preparar los datos de la solicitud utilizando FormData
      const formData = new FormData();

      // Añadir el JSON de 'operations' al formData primero
      formData.append(
        "operations",
        JSON.stringify({
          query: `mutation crearVehiculo($files: [Upload!]!, $categorias: [String!]!) {
            crearVehiculo(files: $files, categorias: $categorias) {
              success
              message
              vehiculo {
                id
                placa
                marca
                linea
                modelo
                color
                claseVehiculo
                combustible
                tipoCarroceria
                numeroMotor
                vin
                numeroSerie
                numeroChasis
                propietarioNombre
                propietarioIdentificacion
              }
            }
          }`,
          variables: {
            files: Array(files.length).fill(null),
            categorias: files.map((file) =>
              file.category?.toUpperCase().replace(/ /g, "_")
            ),
          },
        })
      );

      // Añadir el JSON del 'map' al formData después del 'operations'
      const map: Record<string, string[]> = {};
      files.forEach((_: any, index: number) => {
        map[index.toString()] = [`variables.files.${index}`];
      });

      formData.append("map", JSON.stringify(map));

      // Añadir los archivos al formData
      files.forEach((file, index) => {
        formData.append(`${index}`, file.realFile, file.name);
      });

      // Realizar la solicitud HTTP a través de axios
      const response = await axios({
        method: "POST",
        url: import.meta.env.VITE_API_URL, // URL de tu backend GraphQL
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`, // Añadir el token al header
        },
      });

      // Obtener los datos de la respuesta
      const {
        data: { data: responseData, errors },
      } = response;

      // Manejar la respuesta
      if (errors && errors.length > 0) {
        dispatch({
          type: "SET_ALERTA",
          payload: {
            success: false,
            message: errors[0].message,
          },
        })
        throw new Error(errors.map((err: any) => err.message).join(", "));
      }

      if (responseData?.crearVehiculo) {
        const { success, message, vehiculo } = responseData.crearVehiculo;

        // Si fue exitoso, actualiza el estado del vehículo
        if (success && vehiculo) {
          dispatch(
            {
              type: "SET_ALERTA",
              payload: {
                success: success,
                message: message,
              }
            }
          )
        } else {
          throw new Error(message || "Error en la creación del vehículo");
        }
      }

      throw new Error("Respuesta inesperada del servidor");
    } catch (error) {
      // Manejo de errores
      console.error("Error en la solicitud", error);
      throw error;
    }finally{
      dispatch({
        type: "SET_LOADING",
        payload: false,
      })
      
      setTimeout(() => {
        dispatch({
          type: "CLEAR_ALERTA",
        })
      }, 2000);
    }
  };

  useEffect(() => {
    if (vehiculosData) {
      obtenerVehiculos();
    }
  }, [vehiculosData, obtenerVehiculos]);

  if (errorQueryVehiculos) {
    console.error("Error obteniendo liquidaciones:", errorQueryVehiculos);
  }

  return (
    <VehiculoContext.Provider value={{ state, dispatch, agregarVehiculo }}>
      {children}
    </VehiculoContext.Provider>
  );
};
