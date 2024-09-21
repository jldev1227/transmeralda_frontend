import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Configura la URL del servidor GraphQL utilizando variables de entorno de Vite
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_API_URL || '', // Accede a la variable de entorno usando import.meta.env
});

// Link para autenticar la solicitud con el token almacenado en localStorage
const authLink = setContext((operation, { headers = {} }) => {
  const token = localStorage.getItem('authToken'); // Obtener el token del localStorage

  // Si no hay token y la operación no requiere autenticación (como 'AutenticarUsuario'), no añadir el header de autenticación
  if (!token && operation.operationName === 'AutenticarUsuario') {
    return {
      headers: {
        ...headers, // Asegurar que devolvemos los headers existentes aunque no haya token
      },
    };
  }

  if (!token) {
    return {
      headers: {
        ...headers, // Devuelve cualquier header existente, aunque no haya token
      },
    };
  }

  // Añadir el token al header Authorization si está presente
  return {
    headers: {
      ...headers, // Asegurar que se conservan otros headers
      Authorization: `Bearer ${token}`, // Incluir el token en la solicitud
    },
  };
});

// Inicializa el Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'no-cache',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
