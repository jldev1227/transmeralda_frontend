
import {
    createContext,
    ReactNode,
    useReducer,
    Dispatch,
    useEffect,
    useCallback,
} from "react";
import { useQuery } from "@apollo/client";
import { FormularioActions, FormularioReducer, FormularioState, initialState } from "@/reducers/formulario-reducer";
import { OBTENER_FORMULARIOS } from "@/graphql/formulario";

// Tipo del contexto
interface FormularioContextType {
    state: FormularioState;
    dispatch: Dispatch<FormularioActions>;
}

// Crear el contexto
export const FormularioContext = createContext<FormularioContextType | null>(null);

// Props del provider
interface FormularioProviderProps {
    children: ReactNode;
}

// Provider del contexto
export const FormularioProvider = ({ children }: FormularioProviderProps) => {
    const [state, dispatch] = useReducer(FormularioReducer, initialState);


    const {
        data: formulariosData,
        loading: loadingFormularios,
        error: errorQueryFormularios,
    } = useQuery(OBTENER_FORMULARIOS);

    const obtenerFormularios = useCallback(() => {
        if (!loadingFormularios && formulariosData.obtenerFormularios) {
            dispatch({
                type: "SET_FORMULARIOS",
                payload: formulariosData.obtenerFormularios,
            });
        }
    }, [formulariosData, loadingFormularios, dispatch]);


    useEffect(() => {
        if (formulariosData) {
            obtenerFormularios();
        }
    }, [formulariosData, obtenerFormularios]);


    if (errorQueryFormularios) {
        console.error("Error obteniendo liquidaciones:", errorQueryFormularios);
    }


    return (
        <FormularioContext.Provider
            value={{ state, dispatch }}
        >
            {children}
        </FormularioContext.Provider>
    );
};
