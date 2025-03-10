import { Formulario } from "../types/index";

// Definimos los tipos de acciones que puede manejar el reducer
export type FormularioActions =
    | { type: 'SET_FORMULARIOS'; payload: Formulario[] }

// Definimos el estado inicial del Formulario
export type FormularioState = {
    formularios: Formulario[] | [],
};

export const initialState: FormularioState = {
    formularios: [],
};

// Reducer del Formulario
export function FormularioReducer(
    state: FormularioState = initialState,
    action: FormularioActions
): FormularioState {
    if (action.type === 'SET_FORMULARIOS') {
        return {
            ...state,
            formularios: action.payload,
        }
    } else {
        return state;
    }
}