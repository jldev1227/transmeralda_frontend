import { LiquidacionContext } from "@/context/LiquidacionContext";
import { useContext } from "react";

export default function useLiquidacion() {
    const context = useContext(LiquidacionContext);
    if (!context) throw new Error('useLiquidacion must be used within an LiquidacionProvider');
    return context;
}