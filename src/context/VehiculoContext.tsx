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

// Definir el tipo del contexto
interface VehiculoContextType {
  state: VehiculoState;
  dispatch: Dispatch<VehiculoActions>;
  agregarVehiculo: (vehiculo: FileDetailsVehiculos[]) => void;
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
  const agregarVehiculo = useCallback(
    async (vehiculo: FileDetailsVehiculos[]) => {
      try {
        console.log(vehiculo)
      } catch (err) {
        console.log(err);
      }
    },
    [dispatch]
  );

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
