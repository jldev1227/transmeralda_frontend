import { DateValue } from "@nextui-org/react";
import { SVGProps } from "react";

export type ConfiguracionLiquidacion = {
  id?: string;
  nombre: string;
  valor: number;
}

// Definición de tipos para SVG
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Tipos para Bonificaciones, Pernotes y Recargos
export type Bono = {
  id?: string;
  name: string;
  values: { mes: string; quantity: number }[];
  value: number;
  vehiculoId?: string; // Hacer vehiculoId opcional
  __typename?: string;
}

export type Mantenimiento = {
  id?: string;
  values: { mes: string; quantity: number }[];
  value: number;
  vehiculoId?: string; // Hacer vehiculoId opcional
  __typename?: string;
}

export type BonificacionesAcc = {
  [key: string]: {
    name: string;
    quantity: number;
    totalValue: number;
  };
}

export type Pernote = {
  id?: string;
  empresa: string;
  cantidad: number;
  valor: number;
  vehiculoId?: string | null;
  fechas: string[]; // Se agrega el array de fechas
  __typename?: string;
};


export type Recargo = {
  id?: string;
  empresa: string;
  valor: number;
  vehiculoId?: string | null;
  pagCliente: boolean | null;
  mes?: string; // Añadir el campo `mes` de tipo string
  __typename?: string;
};


// Vehículo y Conductor
export type VehiculoOption = {
  value: string;
  label: string;
};

export type ConductorOption = {
  value: string;
  label: string;
};

export type Conductor = {
  id: string;
  nombre: string;
  apellido: string;
  cc: string;
  correo: string;
  salarioBase: number;
};

export type Vehiculo = {
  id: string;
  placa: string;
  marca: string;
  linea: string;
  modelo: string;
  color: string;
  claseVehiculo: string;
  tipoCarroceria: string;
  combustible: string;
  numeroMotor: string;
  vin: string;
  numeroSerie: string;
  numeroChasis: string;
  propietarioNombre: string;
  propietarioIdentificacion: string;
  kilometraje: string;
  estado: string;
  latitud: number;
  longitud: number;
  galeria: Array<TemplateStringsArray>;
  soatVencimiento: string;
  tecnomecanicaVencimiento: string;
  fechaMatricula: string;
  propietarioId: number;
  conductorId: number;
  conductor?: Conductor;
  createdAt: string;
  updateddAt: string;
  __typename?: string;
};

export type Empresa = {
  id?: string,
  NIT: string,
  Nombre: string,
  __typename?: string;
};

export type Anticipo = {
  id?: string;  // Marcamos 'id' como opcional
  liquidacionId: string | undefined;
  valor: number;
};


// Detalles del vehículo, incluyendo Bonificaciones, Pernotes y Recargos
export type DetalleVehiculo = {
  vehiculo: VehiculoOption;
  bonos: Bono[];
  pernotes: Pernote[];
  recargos: Recargo[];
  mantenimientos: Mantenimiento[]
};

type Estado = "Pendiente" | "Liquidado"; // Los posibles valores de `estado`


// Tipo base para propiedades comunes entre Liquidacion y LiquidacionInput
type BaseLiquidacion = {
  conductorId?: Conductor['id'] | null;
  auxilioTransporte: number;
  sueldoTotal: number;
  salarioDevengado: number;
  totalPernotes: number;
  totalBonificaciones: number;
  totalRecargos: number;
  totalVacaciones: number;
  totalAnticipos: number;
  diasLaborados: number;
  diasLaboradosVillanueva: number;
  ajusteSalarial: number;
  salud: number;
  pension: number;
  bonificaciones?: Bono[];              // Bonificaciones opcionales
  mantenimientos?: Mantenimiento[];              // Bonificaciones opcionales
  pernotes?: Pernote[];                 // Pernotes opcionales
  recargos?: Recargo[];                 // Recargos opcionales
  anticipos?: Anticipo[];                 // Recargos opcionales
  estado: Estado; // Asegura que `estado` solo puede ser "pendiente" o "liquidado"
  acciones?: any;  // Agrega 'acciones' como un campo válido
  [key: string]: any; // Opción flexible para indexar propiedades adicionales si no tienes un conjunto fijo
};

// LiquidacionInput: utiliza `DateValue | null` para las fechas
export type LiquidacionInput = BaseLiquidacion & {
  id?: string;
  periodoStart: DateValue | null;  // Asegúrate de que esta propiedad esté incluida
  periodoEnd: DateValue | null;    // Asegúrate de que esta propiedad esté incluida
  periodoStartVacaciones: DateValue | null;  // Asegúrate de que esta propiedad esté incluida
  periodoEndVacaciones: DateValue | null;    // Asegúrate de que esta propiedad esté incluida
  vehiculos: string[]
};

// Liquidacion: utiliza `string` para las fechas
export type Liquidacion = BaseLiquidacion & {
  id?: string;
  conductor: Conductor;
  periodoStart: string;  // Tipo string para las liquidaciones ya guardadas
  periodoEnd: string;    // Tipo string para las liquidaciones ya guardadas
  vehiculos: Vehiculo[]; // Array de valores de vehículos (IDs)
};

// Usuario y credenciales de login
export interface LoginCredentials {
  correo: string;
  password: string;
}

export type Usuario = {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  password: string; // Hashed password
  telefono: number;
  rol: string;
  confirmado: boolean;
  imagenUrl?: string; // Opcional
  token?: string; // Opcional
  createdAt: string;
  updatedAt: string;
};

// Estado de alerta (mensaje de éxito o error)
export interface AlertState {
  success?: boolean | null;
  message?: string;
}
