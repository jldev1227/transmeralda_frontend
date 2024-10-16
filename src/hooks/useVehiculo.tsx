import { VehiculoContext } from "@/context/VehiculoContext";
import { useContext } from "react";

export default function useVehiculo() {
    const context = useContext(VehiculoContext);
    if (!context) throw new Error('useVehiculo must be used within an LiquidacionProvider');
    return context;
}