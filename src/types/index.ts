import { SVGProps } from "react";
import { SingleValue } from "react-select";

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
export type Liquidacion = {
  id: string;
  conductor: SingleValue<ConductorOption>;
  detallesVehiculos: DetalleVehiculo[];
}

export type ConductorOption = {
  value: string;
  label: string;
}

export type VehiculoOption = {
  value: string;
  label: string;
}