import { AlertState, Vehiculo } from "@/types";

export type VehiculoActions =
  | { type: 'SET_VEHICULOS'; payload: Vehiculo[] }
  | { type: 'SET_VEHICULO'; payload: Vehiculo }
  | { type: 'UPDATED_VEHICULO'; payload: Vehiculo }
  | { type: 'SELECT_VEHICULO'; payload: number | string | null }
  | { type: 'SET_MODAL_ADD' }
  | { type: 'SET_MODAL' }
  | { type: 'SET_ALERTA'; payload: AlertState }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ALERTA' }

export type VehiculoState = {
  vehiculos: Vehiculo[];
  selectedVehicleId: number | string | null;
  vehiculo: Vehiculo | null;
  modal: boolean;
  modalAdd: boolean;
  alerta: AlertState | null;
  loading: boolean;
}

export const initialState = {
  vehiculos: [],
  selectedVehicleId: null,
  vehiculo: null,
  modalAdd: false,
  modal: false,
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
    case 'SET_VEHICULO':
      return {
        ...state,
        vehiculo: action.payload,
      };

    case 'UPDATED_VEHICULO':
      return {
        ...state,
        vehiculos: state.vehiculos.map(vehiculo =>
          vehiculo.id === action.payload.id ? { ...vehiculo, ...action.payload } : vehiculo
        ),
        vehiculo: action.payload
      };
    case 'SELECT_VEHICULO':
      return {
        ...state,
        selectedVehicleId: action.payload,
      };
    case 'SET_MODAL_ADD':
      return {
        ...state,
        modalAdd: !state.modalAdd
      };
    case 'SET_MODAL':
      return {
        ...state,
        modal: !state.modal
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