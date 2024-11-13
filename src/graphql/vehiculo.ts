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
            fechaMatricula
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
    fechaMatricula
    conductor {
      id
      nombre
      apellido
    }
  }
}
`
