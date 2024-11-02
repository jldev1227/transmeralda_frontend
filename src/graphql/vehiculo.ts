import { gql } from '@apollo/client'

export const OBTENER_VEHICULOS = gql`
    query ObtenerVehiculos {
        obtenerVehiculos {
            id
            placa
            marca
            linea
            modelo
            kilometraje
            disponibilidad
            galeria
            soatVencimiento
            tecnomecanicaVencimiento
            conductor {
                id
                nombre
                apellido
            }
        }
    }
`
export const OBTENER_VEHICULO = gql`
 query ObtenerVehiculo($id: ID!) {
  obtenerVehiculo(id: $id) {
    id
    placa
    marca
    linea
    modelo
    color
    claseVehiculo
    tipoCarroceria
    combustible
    numeroMotor
    vin
    numeroSerie
    numeroChasis
    propietarioNombre
    propietarioIdentificacion
    kilometraje
    disponibilidad
    galeria
    soatVencimiento
    tecnomecanicaVencimiento
    conductor {
      id
      nombre
      apellido
    }
  }
}
`

export const CREAR_VEHICULO = gql`
  mutation crearVehiculo($files: [Upload!]!, $name: String!, $categorias: [String!]!) {
    crearVehiculo(files: $files, name: $name, categorias: $categorias) {
      success
      message
      vehiculo {
        id
        placa
        marca
        linea
        modelo
        color
        claseVehiculo
        combustible
        tipoCarroceria
        numeroMotor
        vin
        numeroSerie
        numeroChasis
        propietarioNombre
        propietarioIdentificacion
      }
    }
  }
`;

export const ACTUALIZAR_VEHICULO = gql`
  mutation actualizarVehiculo($files: [Upload!]!, $name: String!, $categorias: [String!]!) {
    actualizarVehiculo(files: $files, name: $name, categorias: $categorias) {
      success
      message
      vehiculo {
        id
        placa
        marca
        linea
        modelo
        color
        claseVehiculo
        combustible
        tipoCarroceria
        numeroMotor
        vin
        numeroSerie
        numeroChasis
        propietarioNombre
        propietarioIdentificacion
      }
    }
  }
`;