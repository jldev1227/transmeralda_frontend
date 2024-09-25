import { gql } from "@apollo/client";

export const OBTENER_LIQUIDACIONES = gql`
query Liquidaciones {
    liquidaciones {
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
        vehiculos {
            id
            placa
        }
        bonificaciones {
            id
            name
            values {
                mes
                quantity
            }
            value
            vehiculoId
        }
        pernotes {
            id    
            empresa
            cantidad
            valor
            fechas
        }
        recargos {
            id
            empresa
            valor
            pagCliente
            mes
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
        vehiculos {
            id
            placa
        }
        bonificaciones {
            id
            name
            values {
                mes
                quantity
            }
            value
            vehiculoId
        }
        pernotes {
            id
            empresa
            cantidad
            valor
            fechas
        }
        recargos {
            id
            empresa
            valor
            pagCliente
            mes
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
        vehiculos {
            id
            placa
        }
        bonificaciones {
            id
            name
            values {
                mes
                quantity
            }
            value
            vehiculoId
        }
        pernotes {
            id
            empresa
            cantidad
            valor
            fechas
        }
        recargos {
            id
            empresa
            valor
            pagCliente
            mes
        }
    }
}
`;

