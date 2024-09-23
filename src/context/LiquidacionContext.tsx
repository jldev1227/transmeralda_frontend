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
import { Liquidacion, LiquidacionInput } from "@/types";
import {
  OBTENER_LIQUIDACIONES,
  CREAR_LIQUIDACION,
  EDITAR_LIQUIDACION,
} from "../graphql/liquidacion"; // Asegúrate de tener esta mutación bien definida
import { formatDateValue } from "@/helpers";

type LiquidacionContextType = {
  state: LiquidacionState;
  dispatch: Dispatch<LiquidacionActions>;
  obtenerLiquidaciones: () => void;
  loadingLiquidaciones: boolean;
  submitLiquidacion: (liquidacion: LiquidacionInput) => void;
  setLiquidacion: (liquidacion: Liquidacion) => void;
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
  const [editarLiquidacion] = useMutation(EDITAR_LIQUIDACION);

  // Función para obtener liquidaciones y hacer dispatch, optimizado con useCallback para evitar recrear la función en cada renderizado.
  const obtenerLiquidaciones = useCallback(() => {
    if (!loadingLiquidaciones && data) {
      dispatch({
        type: "SET_LIQUIDACIONES",
        payload: data.liquidaciones,
      });
    }
  }, [data, loadingLiquidaciones, dispatch]);

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
            }
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
        console.log(liquidacion)
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
        liquidacion
      },
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
        submitLiquidacion,
        setLiquidacion,
      }}
    >
      {children}
    </LiquidacionContext.Provider>
  );
};
