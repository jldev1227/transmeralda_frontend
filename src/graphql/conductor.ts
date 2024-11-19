import { gql } from "@apollo/client";

export const OBTENER_CONDUCTORES = gql`
    query ObtenerConductores {
        obtenerConductores {
            id
            nombre
            apellido
            cc
            salarioBase
        }
    }
`
