import { DateValue, RangeValue } from "@nextui-org/react";
import { SVGProps } from "react";

// Definición de tipos para SVG
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Tipos para Bonificaciones, Pernotes y Recargos
export type Bono = { name: string; quantity: number; value: number, vehiculoId: string | null,   __typename?: string; };
export type Pernote = { empresa: string; cantidad: number; valor: number, vehiculoId: string | null,   __typename?: string; }; // Agregado `valor` para pernote
export type Recargo = { empresa: string; valor: number, vehiculoId: string | null,   __typename?: string; };

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

// Detalles del vehículo, incluyendo Bonificaciones, Pernotes y Recargos
export type DetalleVehiculo = {
  vehiculo: VehiculoOption;
  bonos: Bono[];
  pernotes: Pernote[];
  recargos: Recargo[];
};

// Tipo base para propiedades comunes entre Liquidacion y LiquidacionInput
type BaseLiquidacion = {
  conductorId?: Conductor['id'] | null;
  auxilioTransporte: number;
  sueldoTotal: number;
  totalPernotes: number;
  totalBonificaciones: number;
  totalRecargos: number;
  diasLaborados: number;
  ajusteSalarial: number;
  vehiculos: VehiculoOption['value'][]; // Array de valores de vehículos (IDs)
  bonificaciones?: Bono[];              // Bonificaciones opcionales
  pernotes?: Pernote[];                 // Pernotes opcionales
  recargos?: Recargo[];                 // Recargos opcionales
};

// LiquidacionInput: utiliza `DateValue | null` para las fechas
export type LiquidacionInput = BaseLiquidacion & {
  id?: string;
  periodoStart: DateValue | null;  // Asegúrate de que esta propiedad esté incluida
  periodoEnd: DateValue | null;    // Asegúrate de que esta propiedad esté incluida
};

// Liquidacion: utiliza `string` para las fechas
export type Liquidacion = BaseLiquidacion & {
  id?: string;
  conductor: Conductor;
  periodoStart: string;  // Tipo string para las liquidaciones ya guardadas
  periodoEnd: string;    // Tipo string para las liquidaciones ya guardadas
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
  success: boolean;
  message: string;
}
