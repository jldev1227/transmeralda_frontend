import Formulario from "@/components/Formulario";
import LiquidacionesList from "@/components/LiquidacionesList";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <h1 className="text-green-700 font-black text-4xl text-center">Liquidador de Conductores</h1>
      <section className="flex flex-col gap-4 py-8 md:py-10">
        <Formulario/>
        <LiquidacionesList/>
      </section>
    </DefaultLayout>
  );
}
