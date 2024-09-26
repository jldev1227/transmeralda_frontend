import { gql } from "@apollo/client";

export const OBTENER_CONFIGURACION_LIQUIDACION = gql`
    query ConfiguracionesLiquidador {
        configuracionesLiquidador {
            id
            nombre
            valor
        }
    }

`
export const ACTUALIZAR_CONFIGURACION = gql`
    mutation ActualizarConfiguracionesLiquidador($id: ID!, $input: ConfiguracionInput!) {
        actualizarConfiguracionesLiquidador(id: $id, input: $input) {
            id
            nombre
            valor
        }
    }
`;

