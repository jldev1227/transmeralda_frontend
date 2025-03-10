import { gql } from "@apollo/client";

export const OBTENER_FORMULARIOS = gql`
  query ObtenerFormularios {
    obtenerFormularios {
      FormularioId
      Nombre
      Descripcion
      Imagen
    }
  }
`;

export const CREAR_FORMULARIO = gql`
  mutation CrearFormulario($input: FormularioInput!) {
    crearFormulario(input: $input) {
      FormularioId
      Nombre
      Descripcion
      Imagen
      categorias {
        CategoriaId
        Nombre
        Descripcion
        campos {
          CampoId
          Nombre
          Tipo
          Requerido
          Placeholder
          ValorDefecto
          Fuente
          Parametro
          OpcionTrue
          OpcionFalse
          ReferenciaCampo
          ReferenciaPropiedad
          Descripcion
        }
      }
    }
  }
`;
