export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function daysDifference(dateString: string): number {
  const currentDate = new Date().getTime(); // Fecha actual en milisegundos
  const inputDate = new Date(dateString).getTime(); // Fecha ingresada en milisegundos

  // Calculamos la diferencia en milisegundos y la convertimos a días
  const differenceInTime = currentDate - inputDate;
  const differenceInDays = Math.floor(differenceInTime / (1000 * 60 * 60 * 24));

  return differenceInDays;
}