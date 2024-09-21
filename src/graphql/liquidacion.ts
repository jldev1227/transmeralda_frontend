import { gql } from "@apollo/client";

export const OBTENER_LIQUIDACIONES = gql`
 query Liquidaciones {
    liquidaciones {
        id
        auxilioTransporte
        sueldoTotal
        totalPernotes
        totalBonificaciones
        totalRecargos
        diasLaborados
        ajusteSalarial
        conductor {
            id
            nombre
            apellido
        }
        periodo {
            start {
                era
                year
                month
                day
                calendar {
                    identifier
                }
            }
            end {
                era
                year
                month
                day
                calendar {
                    identifier
                }
            }
        }
    }
}

`;

export const CREAR_LIQUIDACION = gql`
    mutation CrearLiquidacion(
        $conductorId: ID!
        $periodoStart: FechaInput!
        $periodoEnd: FechaInput!
        $auxilioTransporte: Float!
        $sueldoTotal: Float!
        $totalPernotes: Float!
        $totalBonificaciones: Float!
        $totalRecargos: Float!
        $diasLaborados: Int!
        $ajusteSalarial: Float!
        $vehiculos: [VehiculoInput!]!
    ) {
        crearLiquidacion(
            conductorId: $conductorId
            periodoStart: $periodoStart
            periodoEnd: $periodoEnd
            auxilioTransporte: $auxilioTransporte
            sueldoTotal: $sueldoTotal
            totalPernotes: $totalPernotes
            totalBonificaciones: $totalBonificaciones
            totalRecargos: $totalRecargos
            diasLaborados: $diasLaborados
            ajusteSalarial: $ajusteSalarial
            vehiculos: $vehiculos
        ) {
            id
            auxilioTransporte
            sueldoTotal
            totalPernotes
            totalBonificaciones
            totalRecargos
            diasLaborados
            ajusteSalarial
            periodo {
                start {
                    year
                    month
                    day
                }
                end {
                    year
                    month
                    day
                }
            }
            conductor {
                id
                nombre
                apellido
                cc
                salarioBase
            }
        }
    }
`