import { gql } from "@apollo/client";

export const OBTENER_LIQUIDACIONES = gql`
 query Liquidaciones {
    liquidaciones {
        id
        conductor {
            id
            nombre
            apellido
            cc
            salarioBase
        }
        sueldoTotal
        ajusteSalarial
        diasLaborados
        totalRecargos
        totalBonificaciones
        totalPernotes
        auxilioTransporte
        periodoStart
        periodoEnd
        bonificaciones {
            id
            name
            value
            quantity 
            vehiculoId
        }
        pernotes {
            id
            empresa
            cantidad
            valor
            vehiculoId
        }
        recargos {
            id
            empresa
            valor
            vehiculoId
        }
        vehiculos {
            id
            placa
        }
    }
}

`;

export const CREAR_LIQUIDACION = gql`
 mutation CrearLiquidacion(
    $conductorId: ID!
    $periodoStart: String!
    $periodoEnd: String!
    $auxilioTransporte: Float!
    $sueldoTotal: Float!
    $totalPernotes: Float!
    $totalBonificaciones: Float!
    $totalRecargos: Float!
    $diasLaborados: Int!
    $ajusteSalarial: Float!
    $vehiculos: [ID!]!
    $bonificaciones: [BonificacionInput!]! 
    $pernotes: [PernoteInput!]!
    $recargos: [RecargoInput!]!
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
        bonificaciones: $bonificaciones
        pernotes: $pernotes
        recargos: $recargos
    ) {
        id
        conductor {
            id
            nombre
            apellido
            cc
            salarioBase
        }
        sueldoTotal
        ajusteSalarial
        diasLaborados
        totalRecargos
        totalBonificaciones
        totalPernotes
        auxilioTransporte
        periodoStart
        periodoEnd
        bonificaciones {
            id
            name
            value
            quantity 
            vehiculoId
        }
        pernotes {
            id
            empresa
            cantidad
            valor
        }
        recargos {
            id
            empresa
            valor
        }
        vehiculos {
            id
            placa
        }
    }
}
`;

export const EDITAR_LIQUIDACION = gql`
 mutation editarLiquidacion(
    $id: ID!
   $conductorId: ID!
    $periodoStart: String!
    $periodoEnd: String!
    $auxilioTransporte: Float!
    $sueldoTotal: Float!
    $totalPernotes: Float!
    $totalBonificaciones: Float!
    $totalRecargos: Float!
    $diasLaborados: Int!
    $ajusteSalarial: Float!
    $vehiculos: [ID!]!
    $bonificaciones: [BonificacionInput!]! 
    $pernotes: [PernoteInput!]!
    $recargos: [RecargoInput!]!
) {
    editarLiquidacion(
        id: $id
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
        bonificaciones: $bonificaciones
        pernotes: $pernotes
        recargos: $recargos
    ) {
        id
        periodoStart
        periodoEnd
        conductor {
            id
            nombre
            apellido
            cc
            salarioBase
        }
        auxilioTransporte
        sueldoTotal
        totalPernotes
        totalBonificaciones
        totalRecargos
        diasLaborados
        ajusteSalarial
        bonificaciones {
            id
            name
            value
            quantity 
            vehiculoId
        }
        pernotes {
            id
            empresa
            cantidad
            valor
            vehiculoId
        }
        recargos {
            id
            empresa
            valor
            vehiculoId
        }
        vehiculos {
            id
            placa
        }
    }
}
`;