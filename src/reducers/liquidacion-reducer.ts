// Definimos los tipos de acciones que puede manejar el reducer
import { Liquidacion, Conductor, Vehiculo, Empresa, ConfiguracionLiquidacion, Anticipo } from '@/types/index';

export type LiquidacionActions =
  | { type: 'SET_LIQUIDACIONES'; payload: Liquidacion[] } // Establece las liquidaciones
  | { type: 'SET_CONDUCTORES'; payload: Conductor[] } // Establece los conductores
  | { type: 'SET_VEHICULOS'; payload: Vehiculo[] } // Establece los vehículos
  | { type: 'SET_EMPRESAS'; payload: Empresa[] } // Establece las empresas
  | { type: 'AGREGAR_LIQUIDACION'; payload: Liquidacion } // Agrega una nueva liquidación
  | { type: 'EDITAR_LIQUIDACION'; payload: Liquidacion } // Edita una liquidación existente
  | {
    type: 'SET_LIQUIDACION';
    payload: { liquidacion: Liquidacion | null; allowEdit: boolean | null };
  } // Establece la liquidación seleccionada y si se permite editar
  | { type: 'SET_CONFIGURACION'; payload: ConfiguracionLiquidacion[] } // Establece la configuración de liquidaciones
  | {
    type: 'UPDATE_CONFIGURACION';
    payload: ConfiguracionLiquidacion[];
  } // Actualiza la configuración de liquidaciones
  | { type: 'AGREGAR_ANTICIPOS'; payload: Anticipo[] } // Agrega anticipos a una liquidación
  | {
    type: 'ELIMINAR_ANTICIPO';
    payload: { liquidacionId: Liquidacion['id']; anticipoId: Anticipo['id'] };
  } // Elimina un anticipo de una liquidación
  | { type: 'SET_MODAL_CONFIGURACION'; payload?: boolean } // Alterna o establece el estado del modal de configuración
  | { type: 'SET_ERROR'; payload: { mensaje: string; tipo?: 'error' | 'warning' | 'info' } } // Establece un mensaje de error
  | { type: 'SET_SUCCESS'; payload: { mensaje: string; tipo?: 'success' | 'info' } }
  | { type: 'RESET_ALERTA' } // Resetea la alerta
  | {
    type: 'SET_LOADING';
    payload: {
      loading: boolean;
      loadingText: string;
    };
  }; // Establece el estado de carga

export type LiquidacionState = {
  liquidaciones: Liquidacion[]; // Lista de liquidaciones
  conductores: Conductor[]; // Lista de conductores
  vehiculos: Vehiculo[]; // Lista de vehículos
  empresas: Empresa[]; // Lista de empresas
  modalConfiguracion: boolean; // Controla si el modal de configuración está abierto
  liquidacion: Liquidacion | null; // Detalle de la liquidación seleccionada
  configuracion: ConfiguracionLiquidacion[] | null; // Configuración para liquidaciones
  allowEdit: boolean | null; // Permitir edición de la liquidación
  alerta: {
    success: boolean; // Indica si la operación fue exitosa
    mensaje: string; // Mensaje a mostrar en la alerta
    tipo?: "error" | "warning" | "info" | "success"; // (Opcional) Tipo de alerta para más contexto
  };
  loading: boolean; // Estado de carga global
  loadingText: string; // Texto asociado al estado de carga
};

// Estado inicial de liquidaciones
export const initialState: LiquidacionState = {
  liquidaciones: [],
  conductores: [],
  vehiculos: [],
  empresas: [],
  liquidacion: null,
  configuracion: null,
  modalConfiguracion: false,
  allowEdit: null,
  alerta: {
    success: false,
    mensaje: "",
    tipo: undefined, // Por defecto no tiene tipo
  },
  loading: false,
  loadingText: "",
};

// Reducer de liquidaciones
export function LiquidacionReducer(
  state: LiquidacionState = initialState,
  action: LiquidacionActions
): LiquidacionState {
  switch (action.type) {
    case 'SET_LIQUIDACIONES':
      return {
        ...state,
        liquidaciones: action.payload,
      };
    case 'SET_CONDUCTORES':
      return {
        ...state,
        conductores: action.payload,
      };
    case 'SET_VEHICULOS':
      return {
        ...state,
        vehiculos: action.payload,
      };
    case 'SET_EMPRESAS':
      return {
        ...state,
        empresas: action.payload,
      };
    case 'AGREGAR_LIQUIDACION':
      return {
        ...state,
        liquidaciones: [...state.liquidaciones, action.payload],
        alerta: {
          success: true,
          mensaje: "Liquidación agregada con éxito",
          tipo: "success",
        },
      };
    case 'EDITAR_LIQUIDACION':
      return {
        ...state,
        liquidaciones: state.liquidaciones.map((liq) =>
          liq.id === action.payload.id ? action.payload : liq
        ),
        alerta: {
          success: true,
          mensaje: "Liquidación actualizada con éxito",
          tipo: "success",
        },
        liquidacion: null
      };
    case 'SET_LIQUIDACION':
      return {
        ...state,
        liquidacion: action.payload.liquidacion,
        allowEdit: action.payload.allowEdit,
      };
    case 'SET_CONFIGURACION':
    case 'UPDATE_CONFIGURACION':
      return {
        ...state,
        configuracion: action.payload,
        ...(action.type === 'UPDATE_CONFIGURACION' && {
          alerta: {
            success: true,
            mensaje: "Configuración actualizada con éxito",
            tipo: "success",
          },
        }),
      };
    case 'SET_MODAL_CONFIGURACION':
      return {
        ...state,
        modalConfiguracion:
          typeof action.payload === 'boolean'
            ? action.payload
            : !state.modalConfiguracion,
      };
    case "AGREGAR_ANTICIPOS":
      // Obtenemos los anticipos del payload
      const nuevosAnticipos = action.payload;

      // Sumar los valores de los anticipos existentes en la liquidación
      const anticiposExistentes = state.liquidacion?.anticipos || [];

      // Sumar los valores de los anticipos existentes y los nuevos
      const totalAnticipos =
        [...anticiposExistentes, ...nuevosAnticipos].reduce((total, anticipo) => {
          return total + (anticipo.valor || 0); // Asegurarte de que anticipo.valor no sea undefined
        }, 0) || 0; // Si el resultado es undefined, establecer en 0

      if (state.liquidacion) {
        const liquidacionActualizada = {
          ...state.liquidacion,
          totalAnticipos, // Actualizamos totalAnticipos con la suma de los nuevos y existentes
          anticipos: [
            ...anticiposExistentes, // Mantener los anticipos existentes
            ...nuevosAnticipos,     // Agregar los nuevos anticipos
          ]
        };

        // Retornar el nuevo estado solo si la liquidación está completa
        return {
          ...state,
          liquidaciones: state.liquidaciones.map((liquidacion) => {
            // Para cada liquidación, verificamos si es la que corresponde
            const anticiposParaLiquidacion = nuevosAnticipos.filter(
              (anticipo) => anticipo.liquidacionId === liquidacion.id
            );

            // Si hay anticipos para esta liquidación, los agregamos
            if (anticiposParaLiquidacion.length > 0) {
              return {
                ...liquidacion,
                totalAnticipos,
                sueldoTotal: liquidacion.sueldoTotal - totalAnticipos,
                anticipos: [
                  ...(liquidacion.anticipos ?? []),
                  ...anticiposParaLiquidacion
                ],
              };
            }

            // Si no es la liquidación correspondiente, la devolvemos sin cambios
            return liquidacion;
          }),
          liquidacion: liquidacionActualizada,
        };
      } else {
        // Retornar el estado actual si no hay liquidación
        return state;
      };
    case "ELIMINAR_ANTICIPO":
      const { anticipoId, liquidacionId } = action.payload;

      // Actualizar liquidaciones
      return {
        ...state,
        liquidaciones: state.liquidaciones.map((liquidacion) => {
          if (liquidacion.id === liquidacionId) {
            // Filtrar los anticipos para eliminar el anticipo específico
            const anticiposActualizados = liquidacion?.anticipos?.filter(
              (anticipo) => anticipo.id !== anticipoId
            ) || [];

            // Recalcular el totalAnticipos para esta liquidación
            const totalAnticipos = anticiposActualizados.reduce((total, anticipo) => {
              return total + (anticipo.valor || 0);
            }, 0);

            return {
              ...liquidacion,
              sueldoTotal: (liquidacion.sueldoTotal + liquidacion.totalAnticipos) - totalAnticipos,
              anticipos: anticiposActualizados,
              totalAnticipos, // Actualizamos el total de anticipos
            };
          }
          return liquidacion; // Retornar la liquidación sin cambios si no coincide
        }),
        liquidacion: state.liquidacion
          ? {
            ...state.liquidacion,
            anticipos: state.liquidacion.anticipos?.filter(
              (anticipo) => anticipo.id !== anticipoId
            ) || [],
            // Recalcular el totalAnticipos en la liquidación activa
            totalAnticipos: state.liquidacion.anticipos
              ?.filter((anticipo) => anticipo.id !== anticipoId)
              .reduce((total, anticipo) => total + (anticipo.valor || 0), 0) || 0,
          }
          : null, // Si no hay liquidación activa, mantenerla como null
      };
    case 'SET_ERROR':
      return {
        ...state,
        alerta: {
          success: false,
          mensaje: action.payload.mensaje,
          tipo: "error",
        },
        loading: false,
        loadingText: "",
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload.loading,
        loadingText: action.payload.loadingText,
      };
    case 'RESET_ALERTA':
      return {
        ...state,
        alerta: {
          success: false,
          mensaje: "",
          tipo: undefined,
        },
      };
    default:
      console.warn(`Acción no manejada: ${action.type}`);
      return state;
  }
}
