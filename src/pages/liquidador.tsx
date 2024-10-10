import Formulario from "@/components/Formulario";
import LiquidacionesList from "@/components/LiquidacionesList";
import AlertaModal from "@/components/AlertaModal";
import ModalConfiguracionLiquidador from "@/components/ModalConfiguracionLiquidador";
import FiltrarLiquidaciones from "@/components/FiltrarLiquidaciones";
import { Tabs, Tab } from "@nextui-org/tabs";

export default function Liquidador() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col space-y-2">
        <Tabs className="mx-auto" color="primary" aria-label="Sections">
          <Tab key="liquidar" title="Liquidar">
            <Formulario />
            <LiquidacionesList />
          </Tab>
          <Tab key="filtrar" title="Filtrar">
            <FiltrarLiquidaciones />
          </Tab>
        </Tabs>
      </div>
      <AlertaModal />
      <ModalConfiguracionLiquidador />
    </div>
  );
}
