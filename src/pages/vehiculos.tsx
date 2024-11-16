import ModalAddVehiculo from "@/components/ModalAddVehiculo";
import ModalVehiculo from "@/components/ModalVehiculo";
import VehiculosList from "@/components/VehiculosList";

export default function Vehiculos() {
  return (
    <div className="px-10 space-y-8">
      <h1 className="text-green-700 font-black text-2xl lg:text-4xl text-center">
        Gestión de la Flota de Vehículos
      </h1>
      <VehiculosList/>
      <ModalAddVehiculo/>
      <ModalVehiculo/>
    </div>
  );
}
