// Definimos los tipos de acciones que puede manejar el reducer
import { Liquidacion, Conductor, Vehiculo, Empresa, ConfiguracionLiquidacion, Anticipo } from '@/types/index';

export type LiquidacionActions =
  | { type: 'SET_LIQUIDACIONES'; payload: Liquidacion[] }
  | { type: 'SET_CONDUCTORES'; payload: Conductor[] }
  | { type: 'SET_VEHICULOS'; payload: Vehiculo[] }
  | { type: 'SET_EMPRESAS'; payload: Empresa[] }
  | { type: 'AGREGAR_LIQUIDACION'; payload: Liquidacion }
  | { type: 'EDITAR_LIQUIDACION'; payload: Liquidacion }
  | { type: 'SET_LIQUIDACION'; payload: { liquidacion: Liquidacion | null, allowEdit: boolean | null } }
  | { type: 'SET_CONFIGURACION'; payload: ConfiguracionLiquidacion[] }
  | { type: 'UPDATE_CONFIGURACION'; payload: ConfiguracionLiquidacion[] }
  | { type: 'AGREGAR_ANTICIPOS'; payload: Anticipo[] }
  | { type: 'ELIMINAR_ANTICIPO'; payload: { liquidacionId: Liquidacion['id'], anticipoId: Anticipo['id'] } }
  | { type: 'SET_MODAL_CONFIGURACION'; }
  | { type: 'SET_ERROR'; payload: { error: boolean; mensaje: string } }
  | { type: 'RESET_ALERTA' };

export type LiquidacionState = {
  liquidaciones: Liquidacion[]; // Cambiamos a un array de Liquidacion, no null
  conductores: Conductor[]; // Cambiamos a un array de Liquidacion, no null
  vehiculos: Vehiculo[]; // Cambiamos a un array de Liquidacion, no null
  empresas: Empresa[]; // Cambiamos a un array de Liquidacion, no null
  modalConfiguracion: boolean,
  liquidacion: Liquidacion | null; // Cambiamos a un array de Liquidacion, no null
  configuracion: ConfiguracionLiquidacion[] | null; // Cambiamos a un array de Liquidacion, no null
  allowEdit: boolean | null; // Cambiamos a un array de Liquidacion, no null
  alerta: {
    visible: boolean, // Indica si la alerta está visible
    success: boolean, // Indica si fue un éxito o un error
    mensaje: string, // Mensaje que será mostrado
  },
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
    visible: false, // Indica si la alerta está visible
    success: false, // Indica si fue un éxito o un error
    mensaje: "", // Mensaje que será mostrado
  },
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
          visible: true,
          success: true,
          mensaje: "Liquidación agregada con éxito", // Mensaje de éxito
        },
      };
    case 'EDITAR_LIQUIDACION':
      return {
        ...state,
        liquidacion: null,
        liquidaciones: state.liquidaciones.map((liquidacion) =>
          liquidacion.id === action.payload.id ? action.payload : liquidacion
        ),
        alerta: {
          visible: true,
          success: true,
          mensaje: "Liquidación actualizada con éxito", // Mensaje de éxito
        },
      };
    case "SET_ERROR":
      return {
        ...state,
        alerta: {
          visible: true,
          success: false,
          mensaje: action.payload.mensaje,
        },
      };
    case "RESET_ALERTA": // Acción para ocultar la alerta
      return {
        ...state,
        alerta: {
          visible: false,
          success: false,
          mensaje: "",
        },
      };
    case 'SET_LIQUIDACION':
      return {
        ...state,
        liquidacion: action.payload.liquidacion,
        allowEdit: action.payload.allowEdit
      };
    case 'SET_CONFIGURACION':
      return {
        ...state,
        configuracion: action.payload,
      };
    case 'UPDATE_CONFIGURACION':
      return {
        ...state,
        configuracion: action.payload,
        modalConfiguracion: false,
        alerta: {
          visible: true,
          success: true,
          mensaje: "Configuración actualizada con éxito", // Mensaje de éxito
        },
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
    case 'SET_MODAL_CONFIGURACION':
      return {
        ...state,
        modalConfiguracion: !state.modalConfiguracion,
      };
    default:
      return state;
  }
}