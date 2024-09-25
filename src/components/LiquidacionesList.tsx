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

export default function LiquidacionesList() {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const { state, dispatch, loadingLiquidaciones } =
    useLiquidacion();

  const pages = Math.ceil(state.liquidaciones.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return state.liquidaciones.slice(start, end);
  }, [page, state.liquidaciones]);

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

  const isMobile = useMediaQuery("(max-width: 640px)"); // Tailwind `sm` breakpoint

  if (loadingLiquidaciones) return <p>Cargando liquidaciones...</p>;

  if (!state.liquidaciones || state.liquidaciones.length === 0) {
    return <p>No hay liquidaciones registradas.</p>;
  }

  return (
    <div className="space-y-5">
      <h1 className="text-center font-bold text-2xl text-green-700">
        Historial de liquidaciones
      </h1>
      {isMobile ? (
        // Acordeón para dispositivos móviles
        <Accordion variant="splitted">
          {items.map((item, index) => (
            <AccordionItem
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
                    <strong>Días trabajados villanueva:</strong> {item.diasLaboradosVillanueva}
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
        <Table
          aria-label="liquidaciones"
          cellSpacing={2}
          bottomContent={
            <div className="flex w-full justify-center">
              <Pagination
                isCompact
                showControls
                showShadow
                color="success"
                page={page}
                total={pages}
                onChange={(page) => setPage(page)}
              />
            </div>
          }
          classNames={{
            wrapper: "min-h-[222px] ",
          }}
        >
          <TableHeader>
            <TableColumn>#</TableColumn>
            <TableColumn>Periodo</TableColumn>
            <TableColumn>Nombre</TableColumn>
            <TableColumn>Salario básico</TableColumn>
            <TableColumn>Salario devengado</TableColumn>
            <TableColumn>Auxilio transporte</TableColumn>
            <TableColumn>Días laborados</TableColumn>
            <TableColumn>Días laborados Villanueva</TableColumn>
            <TableColumn>Bonificaciones</TableColumn>
            <TableColumn>Pernotes</TableColumn>
            <TableColumn>Recargos</TableColumn>
            <TableColumn>Bonificación villanueva</TableColumn>
            <TableColumn>Salario total</TableColumn>
            <TableColumn>Acciones</TableColumn>
          </TableHeader>
          <TableBody
            emptyContent={"No hay liquidaciones registradas."}
            items={items}
          >
            {(item: Liquidacion) => (
              <TableRow key={item?.id || `row-${item?.conductor?.cc}`}>
                <TableCell className="text-tiny">{item?.id}</TableCell>
                <TableCell className="text-tiny">
                  {formatDate(item?.periodoStart)} -{" "}
                  {formatDate(item?.periodoEnd)}
                </TableCell>
                <TableCell className="text-tiny">{`${item?.conductor?.nombre} ${item.conductor?.apellido}`}</TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.conductor?.salarioBase ?? 0)}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.salarioDevengado ?? 0)}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.auxilioTransporte)}
                </TableCell>
                <TableCell className="text-tiny">
                  {item?.diasLaborados}
                </TableCell>
                <TableCell className="text-tiny">
                  {item?.diasLaboradosVillanueva}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.totalBonificaciones)}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.totalPernotes)}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.totalRecargos)}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.ajusteSalarial)}
                </TableCell>
                <TableCell className="text-tiny">
                  {formatToCOP(item?.sueldoTotal)}
                </TableCell>
                <TableCell className="flex gap-2">
                  <Tooltip content="Editar" color="primary">
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
                      className="h-9"
                      isIconOnly
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </Button>
                  </Tooltip>
                  <Tooltip content="Consultar" color="secondary">
                    <Button
                       onPress={() =>
                        dispatch({
                          type: "SET_LIQUIDACION",
                          payload: {
                            allowEdit: false,
                            liquidacion: item,
                          },
                        })
                      }
                      color="secondary"
                      className="h-9"
                      isIconOnly
                    >
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
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </Button>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
