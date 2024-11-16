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
import { OBTENER_VEHICULO, OBTENER_VEHICULOS } from "@/graphql/vehiculo";
import { useQuery } from "@apollo/client";
import { FileDetailsVehiculos } from "@/hooks/useDropzone";
import axios from "axios";

// Definir el tipo del contexto
interface VehiculoContextType {
  state: VehiculoState;
  dispatch: Dispatch<VehiculoActions>;
  agregarVehiculo: (files: FileDetailsVehiculos[]) => void;
  actualizarVehiculo: (file: FileDetailsVehiculos) => void;
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

  const { data: vehiculoData, error: errorQueryVehiculo } = useQuery(
    OBTENER_VEHICULO,
    {
      variables: { id: state.selectedVehicleId }, // Reemplaza "el_id_del_vehiculo" con el ID correcto
      skip: !state.selectedVehicleId, // Para evitar ejecutar la consulta si no hay un id
    }
  );

  const obtenerVehiculos = useCallback(() => {
    if (!loadingVehiculos && vehiculosData.obtenerVehiculos) {
      dispatch({
        type: "SET_VEHICULOS",
        payload: vehiculosData.obtenerVehiculos,
      });
    }
  }, [vehiculosData, loadingVehiculos, dispatch]);

  // Función para crear un vehículo en la app web
  const agregarVehiculo = async (files: FileDetailsVehiculos[]) => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: true,
      });
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
                kilometraje
                galeria
                soatVencimiento
                tecnomecanicaVencimiento
                conductor {
                    id
                    nombre
                    apellido
                }
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
        });
        throw new Error(errors.map((err: any) => err.message).join(", "));
      }

      if (responseData?.crearVehiculo) {
        const { success, message, vehiculo } = responseData.crearVehiculo;

        // Si fue exitoso, actualiza el estado del vehículo
        if (success && vehiculo) {
          dispatch({
            type: "SET_ALERTA",
            payload: {
              success: success,
              message: message,
            },
          });

          setTimeout(() => {
            dispatch({
              type: "SET_MODAL_ADD",
            });
          }, 2000);
        } else {
          throw new Error(message || "Error en la creación del vehículo");
        }
      }

      throw new Error("Respuesta inesperada del servidor");
    } catch (error) {
      // Manejo de errores
      console.error("Error en la solicitud", error);
      setTimeout(() => {
        dispatch({
          type: "CLEAR_ALERTA",
        });
      }, 2000);

      throw error;
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: false,
      });
    }
  };

  // Función para crear un vehículo en la app web
  const actualizarVehiculo = async (file: FileDetailsVehiculos) => {
    try {
      dispatch({
        type: "SET_LOADING",
        payload: true,
      });

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
          query: `mutation actualizarVehiculo($id: ID!, $file: Upload!, $categoria: String!) {
            actualizarVehiculo(id: $id, file: $file, categoria: $categoria) {
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
                estado
                vin
                numeroSerie
                numeroChasis
                propietarioNombre
                propietarioIdentificacion
                soatVencimiento
                tecnomecanicaVencimiento
                fechaMatricula
                conductor {
                  id
                  nombre
                  apellido
                  cc
                }
              }
            }
          }`,
          variables: {
            file: null,
            id: state.vehiculo?.id,
            categoria: file.category?.toUpperCase().replace(/ /g, "_"),
          },
        })
      );

      // Añadir el JSON del 'map' al formData
      formData.append(
        "map",
        JSON.stringify({
          "0": ["variables.file"],
        })
      );

      // Añadir el archivo al formData
      formData.append("0", file.realFile, file.name);

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
        });
        throw new Error(errors.map((err: any) => err.message).join(", "));
      }

      if (responseData?.actualizarVehiculo) {
        const { success, message, vehiculo } = responseData.actualizarVehiculo;

        // Si fue exitoso, actualiza el estado del vehículo
        if (success && vehiculo) {
          dispatch({
            type: "SET_ALERTA",
            payload: {
              success: success,
              message: message,
            },
          });

          dispatch({
            type: 'UPDATED_VEHICULO',
            payload: vehiculo,
          });

          setTimeout(() => {
            dispatch({
              type: "CLEAR_ALERTA",
            });
          }, 2000);
          return;
        } else {
          throw new Error(message || "Error en la actualización del vehículo");
        }
      }

      throw new Error("Respuesta inesperada del servidor");
    } catch (error) {
      // Manejo de errores
      console.error("Error en la solicitud", error);
      setTimeout(() => {
        dispatch({
          type: "CLEAR_ALERTA",
        });
      }, 2000);

      throw error;
    } finally {
      dispatch({
        type: "SET_LOADING",
        payload: false,
      });
    }
  };

  useEffect(() => {
    if (vehiculosData) {
      obtenerVehiculos();
    }
  }, [vehiculosData, obtenerVehiculos]);

  useEffect(() => {
    dispatch({
      type: "SET_LOADING",
      payload: true,
    })
    if (vehiculoData && vehiculoData.obtenerVehiculo) {
      // Actualiza el estado con la data del vehículo
      dispatch({
        type: "SET_VEHICULO",
        payload: vehiculoData.obtenerVehiculo,
      });
      dispatch({
        type: "SET_LOADING",
        payload: false,
      })
    }
  }, [vehiculoData, dispatch]);

  if (errorQueryVehiculos) {
    console.error("Error obteniendo vehículos:", errorQueryVehiculos);
  }

  if (errorQueryVehiculo) {
    console.error("Error obteniendo vehículo:", errorQueryVehiculo);
  }

  return (
    <VehiculoContext.Provider
      value={{ state, dispatch, agregarVehiculo, actualizarVehiculo }}
    >
      {children}
    </VehiculoContext.Provider>
  );
};
