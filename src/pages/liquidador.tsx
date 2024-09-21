import Formulario from "@/components/Formulario";
import LiquidacionesList from "@/components/LiquidacionesList";
import ModalLiquidacion from "@/components/ModalLiquidacion";

export default function Liquidador() {
  return (
    <>
      <h1 className="text-green-700 font-black text-4xl text-center">Liquidador de Conductores</h1>
      <section className="flex flex-col gap-0 md:gap-8 py-8 md:py-10">
          <Formulario/>
          <LiquidacionesList/>
        <ModalLiquidacion/>
      </section>
    </>
  );
}
