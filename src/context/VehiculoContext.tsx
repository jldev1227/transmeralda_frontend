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
import { CREAR_VEHICULO, OBTENER_VEHICULOS } from "@/graphql/vehiculo";
import { useMutation, useQuery } from "@apollo/client";
import { FileDetailsVehiculos } from "@/hooks/useDropzone";
import axios from 'axios';

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
  const [crearVehiculo] = useMutation(CREAR_VEHICULO);

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
      console.log(files[0])
      // Obtener el token desde el localStorage
      const token = localStorage.getItem('authToken');
  
      if (!token) {
        throw new Error("Token no proporcionado");
      }
  
      // Preparar los datos de la solicitud utilizando FormData
      const formData = new FormData();
      formData.append("operations", JSON.stringify({
        query: `
          mutation crearVehiculo($file: Upload!, $name: String!) {
            crearVehiculo(file: $file, name: $name) {
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
          }
        `,
        variables: {
          file: null,
          name: "TARJETA DE PROPIEDAD",
        }
      }));
  
      // Mapear los archivos
      formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
  
      // Añadir el archivo PDF
      formData.append("0", files[0].realFile, files[0].name);
  
      // Realizar la solicitud HTTP a través de axios
      const response = await axios({
        method: 'POST',
        url: import.meta.env.VITE_API_URL, // URL de tu backend GraphQL
        data: formData,
        headers: {
          Authorization: `Bearer ${token}`, // Añadir el token al header
          "Content-Type": "multipart/form-data", // Especificar el tipo de contenido
        }
      });
  
      // Obtener los datos de la respuesta
      const { data: { data: responseData } } = response;
  
      // Manejar la respuesta
      if (responseData?.crearVehiculo) {
        const { success, message, vehiculo } = responseData.crearVehiculo;
  
  
        // Si fue exitoso, actualiza el estado del vehículo
        if (success && vehiculo) {
          return true;
        } else {
          throw new Error(message || "Error en la creación del vehículo");
        }
      }
  
      throw new Error("Respuesta inesperada del servidor");
    } catch (error) {
      // Manejo de errores
      let message = "Error en la solicitud";
     
      throw error;
    } finally {
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
