import { gql } from "@apollo/client";

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