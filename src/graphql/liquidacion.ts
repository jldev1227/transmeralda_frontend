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
        diasLaboradosAnual
        ajusteSalarial
        salud
        pension
        cesantias
        interesCesantias
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
        mantenimientos {
            id
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
    $diasLaboradosAnual: Int!
    $ajusteSalarial: Float!
    $salud: Float!
    $pension: Float!
    $cesantias: Float
    $interesCesantias: Float
    $estado: String!
    $vehiculos: [ID!]!
    $bonificaciones: [BonificacionInput!]! 
    $mantenimientos: [MantenimientoInput!]! 
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
      diasLaboradosAnual: $diasLaboradosAnual
      ajusteSalarial: $ajusteSalarial
      salud: $salud
      pension: $pension
      cesantias: $cesantiad
      interesCesantias: $interesCesantias
      estado: $estado
      vehiculos: $vehiculos
      bonificaciones: $bonificaciones
      mantenimientos: $mantenimientos
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
        diasLaboradosAnual
        ajusteSalarial
        salud
        pension
        cesantias
        interesCesantias
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
        mantenimientos {
            id
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
    $diasLaboradosAnual: Int
    $ajusteSalarial: Float!
    $salud: Float!
    $pension: Float!
    $estado: String!
    $cesantias: Float
    $interesCesantias: Float
    $vehiculos: [ID!]!
    $bonificaciones: [BonificacionInput!]! 
    $mantenimientos: [MantenimientoInput!]! 
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
        diasLaboradosAnual: $diasLaboradosAnual
        ajusteSalarial: $ajusteSalarial
        salud: $salud
        pension: $pension
        estado: $estado
        cesantias: $cesantias
        interesCesantias: $interesCesantias
        vehiculos: $vehiculos
        bonificaciones: $bonificaciones
        mantenimientos: $mantenimientos
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
        diasLaboradosAnual
        ajusteSalarial
        salud
        pension
        cesantias
        interesCesantias
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
        mantenimientos {
            id
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

export const OBTENER_VEHICULOS = gql`
    query ObtenerVehiculos {
        obtenerVehiculos {
            id
            placa
        }
    }
`

export const OBTERNER_EMPRESAS = gql`
    query ObtenerEmpresas {
        obtenerEmpresas {
            id
            NIT
            Nombre
            Representante
            Cedula
            Telefono
            Direccion
        }
    }
`

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

export const CREAR_ANTICIPOS = gql`
    mutation RegistrarAnticipos($anticipos: [AnticipoInput!]!) {
        registrarAnticipos(anticipos: $anticipos) {
            id
            valor
            liquidacionId
        }
    }
`;

export const ELIMINAR_ANTICIPO = gql`
  mutation EliminarAnticipo($id: ID!) {
    eliminarAnticipo(id: $id)
  }
`;