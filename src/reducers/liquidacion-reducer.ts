// Definimos los tipos de acciones que puede manejar el reducer
import { Liquidacion } from '@/types/index';

export type LiquidacionActions =
  | { type: 'SET_LIQUIDACIONES'; payload: Liquidacion[] }
  | { type: 'AGREGAR_LIQUIDACION'; payload: Liquidacion }
  | { type: 'SET_LIQUIDACION'; payload: Liquidacion }
  | { type: 'SET_MODAL' }

export type LiquidacionState = {
  liquidaciones: Liquidacion[]; // Cambiamos a un array de Liquidacion, no null
  liquidacion: Liquidacion | null; // Cambiamos a un array de Liquidacion, no null
  modal: boolean; // Cambiamos a un array de Liquidacion, no null
};

// Estado inicial de liquidaciones
export const initialState: LiquidacionState = {
  liquidaciones: [], // Cargar desde localStorage si existe
  liquidacion: null, // Cargar desde localStorage si existe
  modal: false // Cambiamos a un array de Liquidacion, no null
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
      return {
        ...state,
        liquidaciones: [...state.liquidaciones, action.payload]
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