import { useEffect, useState } from "react";
import useLiquidacion from "@/hooks/useLiquidacion";
import { formatDate, formatToCOP } from "@/helpers";
import { Button } from "@nextui-org/button";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import HistorialLiquidaciones from "./HistorialLiquidaciones";

export default function LiquidacionesList() {
  const { state, dispatch, loadingLiquidaciones } = useLiquidacion();

  function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(query);

      // Verifica si la consulta media coincide
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Usar `addEventListener` en lugar de `addListener`
      media.addEventListener("change", listener);

      return () => {
        // Usar `removeEventListener` en lugar de `removeListener`
        media.removeEventListener("change", listener);
      };
    }, [matches, query]);

    return matches;
  }

  const isMobile = useMediaQuery("(max-width: 1080px)"); // Tailwind `sm` breakpoint

  if (loadingLiquidaciones) return <p>Cargando liquidaciones...</p>;

  if (!state.liquidaciones || state.liquidaciones.length === 0) {
    return <p>No hay liquidaciones registradas.</p>;
  }

  return (
    <div className="space-y-5">
      <h2 className="font-bold text-2xl text-green-700">Historial</h2>
      {isMobile ? (
        // Acordeón para dispositivos móviles
        <Accordion variant="splitted">
          {state.liquidaciones.map((item, index) => (
            <AccordionItem
              className={`${item.salarioDevengado === 0 && item.auxilioTransporte === 0 ? "bg-warning-50" : ""}`}
              key={item.id || `liquidacion-${index}`} // Agregamos el textValue para mejorar la accesibilidad
              textValue={`${item.conductor?.nombre} ${item.conductor?.apellido} - ${item.conductor?.cc}`}
              // Personalizar el título del acordeón con la información deseada
              title={
                <span className="text-sm font-bold">
                  {`${item.conductor?.nombre} ${item.conductor?.apellido} - ${item.conductor?.cc}`}
                </span>
              }
              subtitle={
                <div className="flex flex-col text-sm space-y-1">
                  <span>
                    <strong>Vehiculos:</strong>{" "}
                    {item?.vehiculos
                      ?.map((vehiculo) => vehiculo.placa)
                      .join(" - ")}
                  </span>
                  <span>
                    <strong>Periodo:</strong>{" "}
                    {`${formatDate(item.periodoStart)} - ${formatDate(item.periodoEnd)}`}
                  </span>
                  <span>
                    <strong>Días trabajados:</strong> {item.diasLaborados}
                  </span>
                  <span>
                    <strong>Días trabajados villanueva:</strong>{" "}
                    {item.diasLaboradosVillanueva}
                  </span>
                  <span>
                    <strong>Salario total:</strong>{" "}
                    {formatToCOP(item.sueldoTotal)}
                  </span>
                </div>
              }
            >
              <div className="text-sm space-y-6">
                <div>
                  <p className="flex justify-between">
                    <strong>Salario básico:</strong>{" "}
                    {formatToCOP(item.conductor?.salarioBase ?? 0)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Salario devengado:</strong>{" "}
                    {formatToCOP(item.salarioDevengado ?? 0)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Auxilio transporte:</strong>{" "}
                    {formatToCOP(item.auxilioTransporte)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Bonificaciones:</strong>{" "}
                    {formatToCOP(item.totalBonificaciones)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Pernotes:</strong> {formatToCOP(item.totalPernotes)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Recargos:</strong> {formatToCOP(item.totalRecargos)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Ajuste salarial Villanueva:</strong>{" "}
                    {formatToCOP(item.ajusteSalarial)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Salud:</strong> {formatToCOP(item.salud)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Pension:</strong> {formatToCOP(item.pension)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Anticipos:</strong>{" "}
                    {formatToCOP(item.totalAnticipos)}
                  </p>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                  className="w-full"
                    onPress={() =>
                      dispatch({
                        type: "SET_LIQUIDACION",
                        payload: {
                          allowEdit: true,
                          liquidacion: item,
                        },
                      })
                    }
                    color="primary"
                  >
                    Editar
                  </Button>
                  <Button
                  className="w-full"
                    onPress={() => {
                      dispatch({
                        type: "SET_LIQUIDACION",
                        payload: {
                          allowEdit: false,
                          liquidacion: item,
                        },
                      });
                    }}
                    color="secondary"
                  >
                    Ver
                  </Button>
                  <Button className="bg-black text-white" isIconOnly>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        // Tabla para pantallas grandes
        <HistorialLiquidaciones />
      )}
    </div>
  );
}
