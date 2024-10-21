import { gql } from '@apollo/client'

export const OBTENER_VEHICULOS = gql`
    query ObtenerVehiculos {
        obtenerVehiculos {
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
            estado
            latitud
            longitud
            galeria
            propietarioId
            conductorId
            conductor {
                id
                nombre
                apellido
            }
            createdAt
            updatedAt
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