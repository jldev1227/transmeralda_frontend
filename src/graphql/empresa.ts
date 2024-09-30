import { gql } from "@apollo/client";

export const OBTERNER_EMPRESAS = gql`
    query ObtenerEmpresas {
        obtenerEmpresas {
            id
            NIT
            Nombre
        }
    }
`
