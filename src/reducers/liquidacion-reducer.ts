// Definimos los tipos de acciones que puede manejar el reducer
import {
    Liquidacion
} from '@/types/index'

export type LiquidacionActions =
    | { type: 'SET_LIQUIDACIONES'; payload: Liquidacion[] }

export type LiquidacionState = {
    liquidaciones: Liquidacion[] | null,
    liquidacion: Liquidacion | null,
};

export const initialState: LiquidacionState = {
    liquidaciones: null,
    liquidacion: null,
};

// Reducer del usuario
export function LiquidacionReducer(
    state: LiquidacionState = initialState,
    action: LiquidacionActions
): LiquidacionState {

    if (action.type == 'SET_LIQUIDACIONES') {
        return {
            ...state,
            liquidaciones: action.payload,  // Corregido: no necesitas repetir 'state.'
        };
    }

    else {
        return state;
    }

}