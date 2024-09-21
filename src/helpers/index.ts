import { DateSelected } from "@/types";

export const formatToCOP = (value: number | undefined | null) => {
  if (value === undefined || value === null) {
    return 'N/A'; // O cualquier otro valor predeterminado
  }
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};


export function formatDate(day: number | null, month: number | null, year: number | null): string {
  // Verificar que day, month y year no sean undefined y estén dentro de rangos válidos
  if (typeof day !== 'number' || typeof month !== 'number' || typeof year !== 'number') {
    throw new Error('Los parámetros deben ser números.');
  }

  if (month < 1 || month > 12) {
    throw new Error('El mes debe estar entre 1 y 12.');
  }

  if (day < 1 || day > 31) {
    throw new Error('El día debe estar entre 1 y 31.');
  }

  // Crear un objeto Date utilizando los valores de day, month y year
  const date = new Date(year, month - 1, day);

  // Definir opciones para el formato de fecha con tipos correctos
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  // Convertir la fecha al formato deseado utilizando la configuración regional 'es-ES'
  return date.toLocaleDateString('es-ES', options).toUpperCase();
}

export const formatDateRange = (datePart: DateSelected['end' | 'start'] | undefined) => {
  if (!datePart) return "Fecha no disponible";

  const { day = 0, month = 0, year = 0 } = datePart;
  return formatDate(day, month, year);
};
