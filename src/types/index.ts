import { DateValue, RangeValue } from "@nextui-org/react";
import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export type Pernote = { empresa: string; cantidad: number };
export type Recargo = { empresa: string; valor: number };
export type Bono = { name: string; quantity: number; value: number };
export type DetalleVehiculo = {
  vehiculo: VehiculoOption;
  bonos: Bono[];
  pernotes: Pernote[];
  recargos: Recargo[];
};
export type Conductor = {
  id: string,
  nombre: string,
  apellido: string,
  cc: string,
  correo: string,
  salarioBase: number
}

export type Liquidacion = {
  id?: string;
  periodo: RangeValue<DateValue> | null
  conductor: Conductor | null;
  auxilioTransporte: number;
  sueldoTotal: number;
  totalPernotes: number;
  totalBonificaciones: number;
  totalRecargos: number;
  diasLaborados: number,
  ajusteSalarial: number,
  vehiculos: VehiculoOption[] | null; // Añadimos el vehículo si es necesario
};

export type ConductorOption = {
  value: string;
  label: string;
}

export type VehiculoOption = {
  value: string;
  label: string;
}

export type DateSelected = {
  start: {
    era: string;
    year: number;
    month: number;
    day: number;
    calendar: { identifier: string };
  };
  end: {
    era: string;
    year: number;
    month: number;
    day: number;
    calendar: { identifier: string };
  };
}

export interface LoginCredentials {
    correo: string;
    password: string;
}

export type Usuario = {
  id: number;                  // UUID o ObjectId, dependiendo del backend
  nombre: string;                // Nombre completo del usuario
  apellido: string;                // Nombre completo del usuario
  correo: string;              // Dirección de correo electrónico
  password: string;     // Contraseña almacenada de forma segura (hashed)
  telefono: number;              // Teléfono
  rol: String;              // Teléfono
  confirmado: boolean;    // URL de la imagen de perfil (opcional)
  imagenUrl?: string;    // URL de la imagen de perfil (opcional)
  token?: string;              // Token de autenticación (opcional)
  createdAt: String
  updatedAt: String
}

// src/types/alertTypes.ts

export interface AlertState {
  success: boolean;
  message: string;
}
