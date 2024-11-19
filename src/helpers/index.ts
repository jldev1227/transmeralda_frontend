import { DateValue, RangeValue } from "@nextui-org/react";

export const formatToCOP = (value: number | undefined | null) => {
  if (value === undefined || value === null) {
    return 'N/A'; // O cualquier otro valor predeterminado
  }
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};

export const formatCurrency = (value : number) => {
  const formatter = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
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

  // Establecer la hora a medianoche para evitar problemas de zona horaria
  date.setHours(0, 0, 0, 0);

  // Sumar 1 al día
  date.setDate(date.getDate() + 1);

  // Definir opciones para el formato de fecha con tipos correctos
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  };

  // Convertir la fecha al formato deseado utilizando la configuración regional 'es-ES'
  return date.toLocaleDateString('es-ES', options).toUpperCase();
}


export const formatDateValue = (dateValue: DateValue | null): string => {
  if (dateValue) {
    // Ajusta según la estructura de `DateValue`
    return `${dateValue.year}-${String(dateValue.month).padStart(2, '0')}-${String(dateValue.day).padStart(2, '0')}`;
  }
  return ''; // Retorna una cadena vacía si no hay valor
};

export function obtenerMesesEntreFechas(start: string | null, end: string | null): string[] {
  if (!start || !end) {
    return []; // Si alguna de las fechas es null, devolver un array vacío.
  }

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const resultado: string[] = [];

  // Parsear las fechas en formato YYYY-MM-DD
  let fechaActual = new Date(start + "T00:00:00");
  const fechaFinal = new Date(end + "T00:00:00");

  // Asegurarse de que la fecha inicial sea menor o igual a la final
  if (fechaActual > fechaFinal) {
    return []; // Si la fecha de inicio es después de la fecha de fin, devolver un array vacío.
  }

  // Añadir los meses al resultado mientras el año y mes de fechaActual estén antes o iguales a los de fechaFinal
  while (
    fechaActual.getFullYear() < fechaFinal.getFullYear() ||
    (fechaActual.getFullYear() === fechaFinal.getFullYear() && fechaActual.getMonth() <= fechaFinal.getMonth())
  ) {
    const mesNombre = meses[fechaActual.getMonth()];
    if (!resultado.includes(mesNombre)) {
      resultado.push(mesNombre);
    }
    fechaActual.setMonth(fechaActual.getMonth() + 1);
  }

  return resultado;
}

// Función para convertir un Date de JavaScript a un DateValue
export const dateToDateValue = (date : Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Aseguramos que el mes tenga dos dígitos
  const day = String(date.getDate()).padStart(2, '0'); // Aseguramos que el día tenga dos dígitos

  return `${year}-${month}-${day}`;
};

// Función para convertir un DateValue a un Date de JavaScript
export const dateValueToDate = (dateValue: DateValue): Date => {
  return new Date(dateValue.year, dateValue.month - 1, dateValue.day); // En JavaScript, los meses empiezan en 0
};

// Obtener diferencia de días entre dos fechas
export function obtenerDiferenciaDias(periodo: RangeValue<DateValue> | null) : number | string {
  // Verifica si alguna de las fechas es null
  if (!periodo) {
    return 0
  }

  // Convierte las fechas de formato DateValue a objetos Date
  const inicio = new Date(periodo.start.year, periodo.start.month - 1, periodo.start.day);
  const fin = new Date(periodo.end.year, periodo.end.month - 1, periodo.end.day);

  // Calcula la diferencia en milisegundos
  const diferenciaMilisegundos = fin.getTime() - inicio.getTime();

  // Convierte la diferencia de milisegundos a días
  const diferenciaDias = diferenciaMilisegundos / (1000 * 60 * 60 * 24);

  return Math.round(diferenciaDias); // Redondea a días enteros
}

