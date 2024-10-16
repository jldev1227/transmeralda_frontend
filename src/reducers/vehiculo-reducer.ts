import { Vehiculo } from "@/types";

export type VehiculoActions =
    | { type: 'SET_VEHICULOS'; payload: Vehiculo[] }
    | { type: 'SET_MODAL_ADD' }


export type VehiculoState = {
    vehiculos : Vehiculo[];
    modalAdd : boolean;
  }
  
  export const initialState = {
    vehiculos: [],
    modalAdd: false
}

export function VehiculoReducer(
    state: VehiculoState = initialState,
    action: VehiculoActions
  ): VehiculoState {
    switch (action.type) {
      case 'SET_VEHICULOS':
        return {
          ...state,
          vehiculos: action.payload,
        };
      case 'SET_MODAL_ADD':
        return {
          ...state,
          modalAdd: !state.modalAdd
        };
      default:
        return state;
    }
  }