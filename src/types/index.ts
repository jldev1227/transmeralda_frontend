import { DateValue, RangeValue } from "@nextui-org/react";
import { SVGProps } from "react";

// Definición de tipos para SVG
export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Tipos para Bonificaciones, Pernotes y Recargos
export type Bono = { name: string; quantity: number; value: number, vehiculoId: string | null };
export type Pernote = { empresa: string; cantidad: number; valor: number, vehiculoId: string | null }; // Agregado `valor` para pernote
export type Recargo = { empresa: string; valor: number, vehiculoId: string | null };

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

// Liquidación, relacionada con el conductor y los vehículos
export type LiquidacionInput = {
  id?: string;
  periodoStart: DateValue | null; // Cambiado para reflejar un único valor de fecha
  periodoEnd: DateValue | null;   // Cambiado para reflejar un único valor de fecha
  conductorId: Conductor['id'] | null;
  auxilioTransporte: number;
  sueldoTotal: number;
  totalPernotes: number;
  totalBonificaciones: number;
  totalRecargos: number;
  diasLaborados: number;
  ajusteSalarial: number;
  vehiculos: VehiculoOption['value'][]; // Array de valores de vehículos (IDs)
  bonificaciones?: Bono[]; // Bonificaciones opcionales en caso de que se incluyan
  pernotes?: Pernote[]; // Pernotes opcionales
  recargos?: Recargo[]; // Recargos opcionales
};

export type Liquidacion = {
  id?: string;
  periodoStart: string;
  periodoEnd: string;
  conductor: Conductor;
  auxilioTransporte: number;
  sueldoTotal: number;
  totalPernotes: number;
  totalBonificaciones: number;
  totalRecargos: number;
  diasLaborados: number;
  ajusteSalarial: number;
  vehiculos: VehiculoOption['value'][]; // Array de valores de vehículos (IDs)
  bonos: Bono[]; // Bonificaciones de la liquidación
  pernotes: Pernote[]; // Pernotes de la liquidación
  recargos: Recargo[]; // Recargos de la liquidación
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
