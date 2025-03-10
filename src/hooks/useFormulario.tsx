import { FormularioContext } from "@/context/FormularioContext";
import { useContext } from "react";

export default function useFormulario() {
    const context = useContext(FormularioContext);
    if (!context) throw new Error('useFormulario must be used within an FormularioProvider');
    return context;
}