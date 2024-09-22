
export const formatToCOP = (value: number | undefined | null) => {
  if (value === undefined || value === null) {
    return 'N/A'; // O cualquier otro valor predeterminado
  }
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};

export function formatDate(dateString: string | undefined): string {
  if (!dateString) {
    throw new Error('La fecha debe ser una cadena válida.');
  }

  // Crear un objeto Date a partir de la cadena en formato 'YYYY-MM-DD'
  const date = new Date(dateString);

  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha no válida.');
  }

  // Definir opciones para el formato de fecha con tipos correctos
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  // Convertir la fecha al formato deseado utilizando la configuración regional 'es-ES'
  return date.toLocaleDateString('es-ES', options).toUpperCase();
}

