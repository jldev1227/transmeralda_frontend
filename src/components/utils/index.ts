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

export function requiereTecnomecanica(fechaMatricula : string) {
  const fechaMatriculaDate = new Date(fechaMatricula);
  const fechaActual = new Date();
  
  // Calcular el tiempo transcurrido en años desde la fecha de matrícula
  const añosDesdeMatricula = fechaActual.getFullYear() - fechaMatriculaDate.getFullYear();
  const mesesDesdeMatricula = fechaActual.getMonth() - fechaMatriculaDate.getMonth();
  const diasDesdeMatricula = fechaActual.getDate() - fechaMatriculaDate.getDate();

  // Verificar si ya han pasado al menos 2 años (primer RTM) o si requiere la RTM anual después de la primera
  if (añosDesdeMatricula > 2 || 
      (añosDesdeMatricula === 2 && (mesesDesdeMatricula > 0 || (mesesDesdeMatricula === 0 && diasDesdeMatricula >= 0)))) {
      return true; // El vehículo requiere la RTM
  }

  return false; // El vehículo no requiere la RTM aún
}
