import { AlertState, Vehiculo } from "@/types";

export type VehiculoActions =
  | { type: 'SET_VEHICULOS'; payload: Vehiculo[] }
  | { type: 'SET_MODAL_ADD' }
  | { type: 'SET_ALERTA'; payload: AlertState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ALERTA' }

export type VehiculoState = {
  vehiculos: Vehiculo[];
  modalAdd: boolean;
  alerta: AlertState | null;
  loading: boolean;
}

export const initialState = {
  vehiculos: [],
  modalAdd: false,
  alerta: null,
  loading: false
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
    case 'SET_ALERTA':
      return {
        ...state,
        alerta: action.payload
      }
    case 'CLEAR_ALERTA':
      return {
        ...state,
        alerta: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      }
    default:
      return state;
  }
}