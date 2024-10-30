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