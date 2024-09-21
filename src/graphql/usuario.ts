import { gql } from '@apollo/client'

const NUEVO_USUARIO = gql`
  mutation crearUsuario($input: UsuarioInput!) {
    crearUsuario(req: $input) {
      id
      nombre
      correo
    }
  }
`;

const AUTENTICAR_USUARIO = gql`
  mutation AutenticarUsuario($input : AutenticarInput) {
      autenticarUsuario(req: $input) {
          token
          usuario {
              id
              nombre
              apellido
              correo
              telefono
              rol
              imagen
          }
      }
  }
`;

const OBTENER_USUARIO = gql`
  query ObtenerUsuario {
    obtenerUsuario {
      id
      nombre
      apellido
      cc
      correo
      telefono
      rol
    }
  }
`;

export {
  NUEVO_USUARIO,
  AUTENTICAR_USUARIO,
  OBTENER_USUARIO
}