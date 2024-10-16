import React, {
  createContext,
  Dispatch,
  useReducer,
  useEffect,
  useCallback,
} from "react";
import { ApolloError, useMutation, useQuery } from "@apollo/client";
import {
  LiquidacionActions,
  LiquidacionReducer,
  LiquidacionState,
  initialState,
} from "../reducers/liquidacion-reducer";
import {
  Anticipo,
  ConfiguracionLiquidacion,
  Liquidacion,
  LiquidacionInput,
} from "@/types";
import {
  OBTENER_LIQUIDACIONES,
  CREAR_LIQUIDACION,
  EDITAR_LIQUIDACION,
  OBTENER_VEHICULOS,
  OBTENER_CONFIGURACION_LIQUIDACION,
  ACTUALIZAR_CONFIGURACION,
  OBTERNER_EMPRESAS,
  OBTENER_CONDUCTORES,
  CREAR_ANTICIPOS,
  ELIMINAR_ANTICIPO,
} from "../graphql/liquidacion"; // Asegúrate de tener esta mutación bien definida
import { formatDateValue } from "@/helpers";

type LiquidacionContextType = {
  state: LiquidacionState;
  dispatch: Dispatch<LiquidacionActions>;
  obtenerLiquidaciones: () => void;
  loadingLiquidaciones: boolean;
  loadingConductores: boolean;
  submitLiquidacion: (liquidacion: LiquidacionInput) => void;
  setLiquidacion: (liquidacion: Liquidacion) => void;
  handleActualizarConfiguracion: (
    configuracion: ConfiguracionLiquidacion[]
  ) => void;
  agregarAnticipos: (anticipos: Anticipo[]) => void;
  eliminarAnticipo: (
    id: Anticipo["id"],
    liquidacionId: Liquidacion["id"]
  ) => void;
};

export const LiquidacionContext = createContext<LiquidacionContextType | null>(
  null
);

type LiquidacionProviderProps = {
  children: React.ReactNode;
};

export const LiquidacionProvider = ({ children }: LiquidacionProviderProps) => {
  const [state, dispatch] = useReducer(LiquidacionReducer, initialState);

  // Apollo Client hooks
  const {
    data: liquidacionesData,
    loading: loadingLiquidaciones,
    error: errorQueryLiquidaciones,
  } = useQuery(OBTENER_LIQUIDACIONES);
  const {
    data: conductoresData,
    loading: loadingConductores,
    error: errorQueryConductores,
  } = useQuery(OBTENER_CONDUCTORES);
  const {
    data: vehiculosData,
    loading: loadingVehiculos,
    error: errorQueryVehiculos,
  } = useQuery(OBTENER_VEHICULOS);
  const {
    data: empresasData,
    loading: loadingEmpresas,
    error: errorQueryEmpresas,
  } = useQuery(OBTERNER_EMPRESAS);
  const {
    data: configuracionData,
    loading: loadingConfiguracion,
    error: errorQueryConfiguracion,
  } = useQuery(OBTENER_CONFIGURACION_LIQUIDACION);
  const [crearLiquidacion] = useMutation(CREAR_LIQUIDACION);
  const [editarLiquidacion] = useMutation(EDITAR_LIQUIDACION);
  const [actualizarConfiguracion] = useMutation(ACTUALIZAR_CONFIGURACION);
  const [crearAnticipo] = useMutation(CREAR_ANTICIPOS);
  const [eliminarAnticipoMutation] = useMutation(ELIMINAR_ANTICIPO);

  // Función para obtener liquidaciones y hacer dispatch, optimizado con useCallback para evitar recrear la función en cada renderizado.
  const obtenerLiquidaciones = useCallback(() => {
    if (!loadingLiquidaciones && liquidacionesData.liquidaciones) {
      dispatch({
        type: "SET_LIQUIDACIONES",
        payload: liquidacionesData.liquidaciones,
      });
    }
  }, [liquidacionesData, loadingLiquidaciones, dispatch]);

  const obtenerConductores = useCallback(() => {
    if (!loadingConductores && conductoresData.obtenerConductores) {
      dispatch({
        type: "SET_CONDUCTORES",
        payload: conductoresData.obtenerConductores,
      });
    }
  }, [conductoresData, loadingConductores, dispatch]);

  const obtenerVehiculos = useCallback(() => {
    if (!loadingVehiculos && vehiculosData.obtenerVehiculos) {
      dispatch({
        type: "SET_VEHICULOS",
        payload: vehiculosData.obtenerVehiculos,
      });
    }
  }, [vehiculosData, loadingVehiculos, dispatch]);

  const obtenerEmpresas = useCallback(() => {
    if (!loadingEmpresas && empresasData.obtenerEmpresas) {
      dispatch({
        type: "SET_EMPRESAS",
        payload: empresasData.obtenerEmpresas,
      });
    }
  }, [empresasData, loadingEmpresas, dispatch]);

  const submitLiquidacion = async (liquidacion: LiquidacionInput) => {
    try {
      let result: any;
      if (liquidacion?.id) {
        // Si hay un ID, entonces actualiza la liquidación
        result = await actualizarLiquidacion(liquidacion);
      } else {
        // Si no hay un ID, entonces agrega una nueva liquidación
        result = await agregarLiquidacion(liquidacion);
      }

      // Revisa si hay errores en la respuesta de GraphQL
      if (result?.errors && result.errors.length > 0) {
        result.errors.forEach((error: ApolloError) => {
          dispatch({
            type: "SET_ERROR",
            payload: {
              error: true, // true si fue exitoso, false si fue un error
              mensaje: error.message, // Mensaje a mostrar en la alerta
            },
          });
        });
        throw new Error("Errores en la respuesta de GraphQL.");
      }
    } catch (error) {
      console.error("Error en submitLiquidacion:", error);
      throw new Error("Ocurrió un error al intentar registrar la liquidación.");
    }
  };

  // Función para agregar una liquidación, optimizado con useCallback.
  const agregarLiquidacion = useCallback(
    async (liquidacion: LiquidacionInput) => {
      try {
        const { data, errors } = await crearLiquidacion({
          variables: {
            ...liquidacion,
            periodoStart: formatDateValue(liquidacion.periodoStart),
            periodoEnd: formatDateValue(liquidacion.periodoEnd),
          },
        });

        if (data?.crearLiquidacion) {
          dispatch({
            type: "AGREGAR_LIQUIDACION",
            payload: data.crearLiquidacion,
          });
        }

        return { data, errors }; // Asegúrate de retornar los datos y errores
      } catch (err) {
        if (err instanceof ApolloError) {
          handleApolloError(err);
        } else {
          console.error("Error desconocido:", err);
        }
      }
    },
    [crearLiquidacion, dispatch]
  );

  const actualizarLiquidacion = useCallback(
    async (liquidacion: LiquidacionInput) => {
      try {
        const { data, errors } = await editarLiquidacion({
          variables: {
            ...liquidacion,
            periodoStart: formatDateValue(liquidacion.periodoStart),
            periodoEnd: formatDateValue(liquidacion.periodoEnd),
          },
        });

        if (data?.editarLiquidacion) {
          dispatch({
            type: "EDITAR_LIQUIDACION",
            payload: data.editarLiquidacion,
          });
        }

        return { data, errors }; // Asegúrate de retornar los datos y errores
      } catch (err) {
        if (err instanceof ApolloError) {
          handleApolloError(err);
        } else {
          console.error("Error desconocido:", err);
        }
      }
    },
    [editarLiquidacion, dispatch]
  );

  const obtenerConfiguracion = useCallback(() => {
    if (!loadingConfiguracion && configuracionData.configuracionesLiquidador) {
      dispatch({
        type: "SET_CONFIGURACION",
        payload: configuracionData.configuracionesLiquidador,
      });
    }
  }, [configuracionData, loadingConfiguracion, dispatch]);

  const handleActualizarConfiguracion = async (
    configuraciones: ConfiguracionLiquidacion[]
  ) => {
    let errorCounter = 0; // Contador de errores

    for (const config of configuraciones) {
      try {
        await actualizarConfiguracion({
          variables: {
            id: config.id, // Asegúrate de pasar el ID de la configuración
            input: {
              nombre: config.nombre,
              valor: config.valor,
            },
          },
        });
      } catch (error) {
        console.error(
          `Error al actualizar la configuración ${config.nombre}:`,
          error
        );
        errorCounter++; // Incrementa el contador de errores si ocurre alguno
      }
    }

    // Si no hubo errores, ejecuta el dispatch
    if (errorCounter === 0) {
      dispatch({
        type: "UPDATE_CONFIGURACION",
        payload: configuraciones, // Pasa las configuraciones actualizadas como payload
      });
    } else {
      console.error("Algunas configuraciones no se pudieron actualizar.");
    }
  };

  const agregarAnticipos = useCallback(
    async (anticipos: Anticipo[]) => {
      try {
        const { data, errors } = await crearAnticipo({
          variables: {
            anticipos: anticipos.map(({ valor, liquidacionId }) => ({
              valor,
              liquidacionId,
            })),
          },
        });

        if (data?.registrarAnticipos) {
          dispatch({
            type: "AGREGAR_ANTICIPOS",
            payload: data?.registrarAnticipos,
          });
        }

        return { data, errors };
      } catch (err) {
        if (err instanceof ApolloError) {
          handleApolloError(err);
        } else {
          console.error("Error desconocido:", err);
        }
      }
    },
    [crearAnticipo]
  );

  const eliminarAnticipo = async (
    id: Anticipo["id"],
    liquidacionId: Liquidacion["id"]
  ) => {
    try {
      const { data } = await eliminarAnticipoMutation({
        variables: { id },
      });

      if (data.eliminarAnticipo) {
        dispatch({
          type: "ELIMINAR_ANTICIPO",
          payload: { anticipoId: id, liquidacionId }, // Enviar ambos IDs
        });
      } else {
        console.log("Error eliminando el anticipo");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleApolloError = (error: ApolloError) => {
    if (error.networkError) {
      console.error("Error de red:", error.networkError);
    } else if (error.graphQLErrors) {
      error.graphQLErrors.forEach((err) => {
        console.error("Error de GraphQL:", err.message);
      });
    } else {
      console.error("Error:", error.message || error);
    }
  };

  const setLiquidacion = async (liquidacion: Liquidacion): Promise<void> => {
    dispatch({
      type: "SET_LIQUIDACION",
      payload: {
        allowEdit: false,
        liquidacion,
      },
    });
  };

  // Efecto para obtener las liquidaciones cuando los datos están listos
  useEffect(() => {
    if (liquidacionesData) {
      obtenerLiquidaciones();
    }
  }, [liquidacionesData, obtenerLiquidaciones]);

  // Efecto para obtener los Conductores cuando los datos están listos
  useEffect(() => {
    if (conductoresData) {
      obtenerConductores();
    }
  }, [conductoresData, obtenerConductores]);

  // Efecto para obtener los Vehiculos cuando los datos están listos
  useEffect(() => {
    if (vehiculosData) {
      obtenerVehiculos();
    }
  }, [vehiculosData, obtenerVehiculos]);

  // Efecto para obtener los empresas cuando los datos están listos
  useEffect(() => {
    if (empresasData) {
      obtenerEmpresas();
    }
  }, [empresasData, obtenerEmpresas]);

  // Efecto para obtener la configuración cuando los datos están listos
  useEffect(() => {
    if (configuracionData) {
      obtenerConfiguracion();
    }
  }, [configuracionData, obtenerConfiguracion]);

  if (errorQueryLiquidaciones) {
    console.error("Error obteniendo liquidaciones:", errorQueryLiquidaciones);
  }

  if (errorQueryConductores) {
    console.error("Error obteniendo conductores:", errorQueryConductores);
  }

  if (errorQueryVehiculos) {
    console.error("Error obteniendo vehiculos:", errorQueryVehiculos);
  }

  if (errorQueryEmpresas) {
    console.error("Error obteniendo las empresas:", errorQueryEmpresas);
  }

  if (errorQueryConfiguracion) {
    console.error(
      "Error obteniendo la configuración:",
      errorQueryConfiguracion
    );
  }

  return (
    <LiquidacionContext.Provider
      value={{
        state,
        dispatch,
        obtenerLiquidaciones,
        loadingLiquidaciones,
        loadingConductores,
        submitLiquidacion,
        setLiquidacion,
        handleActualizarConfiguracion,
        agregarAnticipos,
        eliminarAnticipo,
      }}
    >
      {children}
    </LiquidacionContext.Provider>
  );
};
