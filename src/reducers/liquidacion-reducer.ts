// Definimos los tipos de acciones que puede manejar el reducer
import { Liquidacion } from '@/types/index';

export type LiquidacionActions =
| { type: 'SET_LIQUIDACIONES'; payload: Liquidacion[] }
| { type: 'AGREGAR_LIQUIDACION'; payload: Liquidacion }
| { type: 'EDITAR_LIQUIDACION'; payload: Liquidacion }
| { type: 'SET_LIQUIDACION'; payload: Liquidacion }
| { type: 'SET_MODAL' }
| { type: 'SET_ERROR'; payload: { error: boolean; mensaje: string } }
| { type: 'RESET_ALERTA' };

export type LiquidacionState = {
  liquidaciones: Liquidacion[]; // Cambiamos a un array de Liquidacion, no null
  liquidacion: Liquidacion | null; // Cambiamos a un array de Liquidacion, no null
  modal: boolean; // Cambiamos a un array de Liquidacion, no null
  alerta: {
    visible: boolean, // Indica si la alerta está visible
    success: boolean, // Indica si fue un éxito o un error
    mensaje: string, // Mensaje que será mostrado
  },
};

// Estado inicial de liquidaciones
export const initialState: LiquidacionState = {
  liquidaciones: [],
  liquidacion: null,
  modal: false,
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
    case 'AGREGAR_LIQUIDACION':
      console.log('action:', action.payload)
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
        liquidacion: action.payload,
      };
    case 'SET_MODAL':
      return {
        ...state,
        modal: !state.modal,
      };
    default:
      return state;
  }
}