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
import { Liquidacion } from "@/types";
import {
  OBTENER_LIQUIDACIONES,
  CREAR_LIQUIDACION,
} from "../graphql/liquidacion"; // Asegúrate de tener esta mutación bien definida

type LiquidacionContextType = {
  state: LiquidacionState;
  dispatch: Dispatch<LiquidacionActions>;
  obtenerLiquidaciones: () => void;
  loadingLiquidaciones: boolean;
  agregarLiquidacion: (liquidacion: Liquidacion) => Promise<void>;
  setLiquidacion: (liquidacion: Liquidacion) => Promise<void>
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
    data,
    loading: loadingLiquidaciones,
    error: errorQuery,
  } = useQuery(OBTENER_LIQUIDACIONES);
  const [crearLiquidacion] = useMutation(CREAR_LIQUIDACION);

  // Función para obtener liquidaciones y hacer dispatch, optimizado con useCallback para evitar recrear la función en cada renderizado.
  const obtenerLiquidaciones = useCallback(() => {
    if (!loadingLiquidaciones && data) {
      console.log(data)
      dispatch({
        type: "SET_LIQUIDACIONES",
        payload: data.liquidaciones,
      });
    }
  }, [data, loadingLiquidaciones, dispatch]);

  // Función para agregar una liquidación, optimizado con useCallback.
  const agregarLiquidacion = useCallback(
    async (liquidacion: Liquidacion) => {

      try {
        // Ejecutar la mutación con los datos de la liquidación
        const { data } = await crearLiquidacion({
          variables: liquidacion, // Asegúrate que las variables coincidan con la mutación
        });

        if (data?.crearLiquidacion) {
          const nuevaLiquidacion = data?.crearLiquidacion;

          // Despachar acción para agregar la nueva liquidación al estado
          dispatch({
            type: "AGREGAR_LIQUIDACION",
            payload: nuevaLiquidacion,
          });
        }
      } catch (err) {
        if (err instanceof ApolloError) {
          console.error(
            "Error de Apollo al crear la liquidación:",
            err.message || err
          );
        } else if (err instanceof Error) {
          // Verifica si 'err' es una instancia de Error
          console.error("Error general creando la liquidación:", err.message);
        } else {
          console.error("Error desconocido creando la liquidación:", err);
        }
      }
    },
    [crearLiquidacion, dispatch]
  );
  
  const setLiquidacion = async (liquidacion: Liquidacion): Promise<void> => {
    return new Promise((resolve) => {
      dispatch({
        type: 'SET_LIQUIDACION',
        payload: liquidacion,
      });
      resolve(); // Resuelve la promesa inmediatamente después de ejecutar dispatch
    });
  };
  

  // Efecto para obtener las liquidaciones cuando los datos están listos
  useEffect(() => {
    if (data) {
      obtenerLiquidaciones();
    }
  }, [data, obtenerLiquidaciones]);

  if (errorQuery) {
    console.error("Error obteniendo liquidaciones:", errorQuery);
  }

  return (
    <LiquidacionContext.Provider
      value={{
        state,
        dispatch,
        obtenerLiquidaciones,
        loadingLiquidaciones,
        agregarLiquidacion,
        setLiquidacion
      }}
    >
      {children}
    </LiquidacionContext.Provider>
  );
};
