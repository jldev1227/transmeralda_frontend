export const columns = [
  { uid: "periodoStart", name: "Periodo", sortable: true },
  { uid: "conductor", name: "Conductor", sortable: false },
  { uid: "salarioDevengado", name: "Salario devengado", sortable: true },
  { uid: "auxilioTransporte", name: "Auxilio transporte", sortable: true },
  { uid: "totalBonificaciones", name: "Bonificaciones", sortable: true },
  { uid: "totalRecargos", name: "Recargos", sortable: true },
  { uid: "totalPernotes", name: "Pernotes", sortable: true },
  { uid: "ajusteSalarial", name: "Ajuste villanueva", sortable: true },
  { uid: "salud", name: "Salud", sortable: true },
  { uid: "pension", name: "Pensión", sortable: true },
  { uid: "totalAnticipos", name: "Anticipos", sortable: true },
  { uid: "sueldoTotal", name: "Salario total", sortable: true },
  { uid: "estado",name: "Estado", sortable: true},
  { uid: "acciones",name: "Acciones", sortable: false},
];

export const statusOptions = [
  {name: "Pendiente", uid: "pendiente"},
  {name: "Liquidado", uid: "liquidado"},
];