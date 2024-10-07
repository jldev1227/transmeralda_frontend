import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";
import { Pagination } from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import { Liquidacion } from "@/types/index";
import useLiquidacion from "@/hooks/useLiquidacion";
import { formatDate, formatToCOP } from "@/helpers";
import { Button } from "@nextui-org/button";
import { Accordion, AccordionItem } from "@nextui-org/accordion";
import { Tooltip } from "@nextui-org/tooltip";
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
      <h2 className="font-bold text-2xl text-green-700">
        Historial
      </h2>
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
                    <strong>Salud:</strong>{" "}
                    {formatToCOP(item.salud)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Pension:</strong>{" "}
                    {formatToCOP(item.pension)}
                  </p>
                  <p className="flex justify-between">
                    <strong>Anticipos:</strong>{" "}
                    {formatToCOP(item.totalAnticipos)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-6 mt-10">
                  <Button
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
                </div>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        // Tabla para pantallas grandes
          <HistorialLiquidaciones/>
      )}
    </div>
  );
}
