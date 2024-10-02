import Formulario from "@/components/Formulario";
import LiquidacionesList from "@/components/LiquidacionesList";
import AlertaModal from "@/components/AlertaModal";
import ModalConfiguracionLiquidador from "@/components/ModalConfiguracionLiquidador";
import FiltrarLiquidaciones from "@/components/FiltrarLiquidaciones";

export default function Liquidador() {
  return (
    <div className="flex flex-col">
      <section className="flex flex-col md:gap-8 py-8 md:py-10">
        <Formulario />
        <LiquidacionesList />
        <FiltrarLiquidaciones />
        <AlertaModal />
        <ModalConfiguracionLiquidador />
      </section>
    </div>
  );
}
