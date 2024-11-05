import { gql } from "@apollo/client";

export const OBTENER_LIQUIDACIONES = gql`
query Liquidaciones {
    liquidaciones {
        id
        periodoStart
        periodoEnd
        periodoStartVacaciones
        periodoEndVacaciones
        conductor {
            id
            nombre
            apellido
            cc
            salarioBase
        }
        auxilioTransporte
        sueldoTotal
        salarioDevengado
        totalPernotes
        totalBonificaciones
        totalRecargos
        totalAnticipos
        totalVacaciones
        diasLaborados
        diasLaboradosVillanueva
        ajusteSalarial
        salud
        pension
        estado
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
            vehiculoId
        }
        recargos {
            id
            empresa
            valor
            pagCliente
            mes
            vehiculoId
        }
        anticipos {
            id
            valor
        }
    }
}
`;

export const CREAR_LIQUIDACION = gql`
  mutation CrearLiquidacion(
    $conductorId: ID!
    $periodoStart: String!
    $periodoEnd: String!
    $periodoStartVacaciones: String!
    $periodoEndVacaciones: String!
    $auxilioTransporte: Float!
    $sueldoTotal: Float!
    $salarioDevengado: Float!
    $totalPernotes: Float!
    $totalBonificaciones: Float!
    $totalRecargos: Float!
    $totalAnticipos: Float!
    $totalVacaciones: Float!
    $diasLaborados: Int!
    $diasLaboradosVillanueva: Int!
    $ajusteSalarial: Float!
    $salud: Float!
    $pension: Float!
    $estado: String!
    $vehiculos: [ID!]!
    $bonificaciones: [BonificacionInput!]! 
    $pernotes: [PernoteInput!]!
    $recargos: [RecargoInput!]!
  ) {
    crearLiquidacion(
      conductorId: $conductorId
      periodoStart: $periodoStart
      periodoEnd: $periodoEnd
      periodoStartVacaciones: $periodoStartVacaciones
      periodoEndVacaciones: $periodoEndVacaciones
      auxilioTransporte: $auxilioTransporte
      sueldoTotal: $sueldoTotal
      salarioDevengado: $salarioDevengado
      totalPernotes: $totalPernotes
      totalBonificaciones: $totalBonificaciones
      totalRecargos: $totalRecargos
      totalAnticipos: $totalAnticipos
      totalVacaciones: $totalVacaciones
      diasLaborados: $diasLaborados
      diasLaboradosVillanueva: $diasLaboradosVillanueva
      ajusteSalarial: $ajusteSalarial
      salud: $salud
      pension: $pension
      estado: $estado
      vehiculos: $vehiculos
      bonificaciones: $bonificaciones
      pernotes: $pernotes
      recargos: $recargos
    ) {
        id
        periodoStart
        periodoEnd
        periodoStartVacaciones
        periodoEndVacaciones
        conductor {
            id
            nombre
            apellido
            cc
            salarioBase
        }
        auxilioTransporte
        sueldoTotal
        salarioDevengado
        totalPernotes
        totalBonificaciones
        totalRecargos
        totalAnticipos
        diasLaborados
        diasLaboradosVillanueva
        ajusteSalarial
        salud
        pension
        estado
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
            vehiculoId
        }
        recargos {
            id
            empresa
            valor
            pagCliente
            mes
            vehiculoId
        }
        anticipos {
            id
            valor
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
    $periodoStartVacaciones: String!
    $periodoEndVacaciones: String!
    $auxilioTransporte: Float!
    $sueldoTotal: Float!
    $salarioDevengado: Float!
    $totalPernotes: Float!
    $totalBonificaciones: Float!
    $totalRecargos: Float!
    $totalAnticipos: Float!
    $totalVacaciones: Float!
    $diasLaborados: Int!
    $diasLaboradosVillanueva: Int!
    $ajusteSalarial: Float!
    $salud: Float!
    $pension: Float!
    $estado: String!
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
        periodoStartVacaciones: $periodoStartVacaciones
        periodoEndVacaciones: $periodoEndVacaciones
        auxilioTransporte: $auxilioTransporte
        sueldoTotal: $sueldoTotal
        salarioDevengado: $salarioDevengado
        totalPernotes: $totalPernotes
        totalBonificaciones: $totalBonificaciones
        totalRecargos: $totalRecargos
        totalAnticipos: $totalAnticipos
        totalVacaciones: $totalVacaciones
        diasLaborados: $diasLaborados
        diasLaboradosVillanueva: $diasLaboradosVillanueva
        ajusteSalarial: $ajusteSalarial
        salud: $salud
        pension: $pension
        estado: $estado
        vehiculos: $vehiculos
        bonificaciones: $bonificaciones
        pernotes: $pernotes
        recargos: $recargos
    ) {
        id
        periodoStart
        periodoEnd
        periodoStartVacaciones
        periodoEndVacaciones
        conductor {
            id
            nombre
            apellido
            cc
            salarioBase
        }
        auxilioTransporte
        sueldoTotal
        salarioDevengado
        totalPernotes
        totalBonificaciones
        totalRecargos
        totalAnticipos
        totalVacaciones
        diasLaborados
        diasLaboradosVillanueva
        ajusteSalarial
        salud
        pension
        estado
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
            vehiculoId
        }
        recargos {
            id
            empresa
            valor
            pagCliente
            mes
            vehiculoId
        }
        anticipos {
            id
            valor
        }
    }
}
`;

