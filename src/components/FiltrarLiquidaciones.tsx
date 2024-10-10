import { mesesDelAño } from "@/data/meses";
import useLiquidacion from "@/hooks/useLiquidacion";
import { selectStyles } from "@/styles/selectStyles";
import { Bono, Conductor, VehiculoOption } from "@/types";
import { Select, SelectItem } from "@nextui-org/select";
import { useCallback, useEffect, useMemo, useState } from "react";
import SelectReact, { SingleValue } from "react-select";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableColumn,
  TableRow,
} from "@nextui-org/table";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Divider } from "@nextui-org/divider";
interface Resultado {
  conductor: Conductor;
  bonosFiltrados: Bono[];
}

interface TotalesBonos {
  bonoAlimentacion: number;
  bonoTrabajado: number;
  bonoTrabajadoDoble: number;
}

export default function FiltrarLiquidaciones() {
  const { state } = useLiquidacion();
  const [vehiculoSelected, setVehiculoSelected] =
    useState<SingleValue<VehiculoOption>>(null);
  const [mesSelected, setMesSelected] =
    useState<SingleValue<string | null>>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  const vehiculosOptions = useMemo(
    () =>
      state.vehiculos.map((vehiculo) => ({
        value: vehiculo.id,
        label: vehiculo.placa,
      })),
    [state.vehiculos]
  );

  const handleVehiculoSelect = useCallback(
    (selected: SingleValue<VehiculoOption>) => {
      if (selected) {
        const selectedVehiculo = {
          value: selected.value,
          label: selected.label,
        };

        // Solo actualiza si `selectedVehiculo` ha cambiado
        if (
          JSON.stringify(selectedVehiculo) !== JSON.stringify(vehiculoSelected)
        ) {
          setVehiculoSelected(selectedVehiculo);
        }
      } else {
        // Si no hay selección, limpia el estado
        setVehiculoSelected(null);
      }
    },
    [vehiculoSelected]
  );

  const handleFilter = useCallback(() => {
    // Convertir el valor de mesSelected a un número
    const selectedMonth = mesSelected ? Number(mesSelected) + 1 : null;

    const conductores = state.liquidaciones.filter((liquidacion) => {
      // Extraer el mes de periodoStart y periodoEnd
      const mesStart = new Date(liquidacion.periodoStart).getMonth() + 1; // getMonth() devuelve 0-11
      const mesEnd = new Date(liquidacion.periodoEnd).getMonth() + 1;

      // Comprobar si mesStart o mesEnd coincide con el mes seleccionado
      const monthCondition =
        selectedMonth !== null &&
        (mesStart === selectedMonth || mesEnd === selectedMonth);

      // Comprobar si alguno de los vehículos en la liquidación coincide con el vehículo seleccionado
      const vehicleCondition = vehiculoSelected
        ? liquidacion.vehiculos.some(
            (vehiculo) => vehiculo.id === vehiculoSelected.value
          )
        : false;

      // Retornar verdadero solo si ambas condiciones se cumplen
      return monthCondition && vehicleCondition;
    });

    if (mesSelected !== null && vehiculoSelected?.value) {
      const resultadosFiltrados = conductores?.map((liquidacion) => {
        const bonosFiltrados = liquidacion?.bonificaciones
          ?.flatMap((bono) => {
            // Filtrar solo aquellos bonos que coincidan con el vehiculoSelected.value
            if (bono.vehiculoId === vehiculoSelected.value) {
              const valuesFiltrados = bono.values.filter(
                (value) => value.mes === mesesDelAño[Number(mesSelected)]?.label
              );

              if (valuesFiltrados.length > 0) {
                return {
                  id: bono.id ?? "",
                  name: bono.name,
                  value: bono.value,
                  values: valuesFiltrados,
                };
              }
            }

            return undefined; // Retornamos undefined si no pasa el filtro de vehiculoId
          })
          ?.filter(Boolean) as Bono[]; // Filtramos los undefined y garantizamos que sea Bono[]

        // Retornar el objeto con conductor y bonos filtrados
        return {
          conductor: liquidacion.conductor, // O la información relevante del conductor
          bonosFiltrados,
        };
      });

      // Actualizamos el estado con el array de resultados filtrados
      setResultados(resultadosFiltrados);
    }
  }, [state.liquidaciones, vehiculoSelected, mesSelected]);

  // Ejecutar handleFilter cuando cambien vehiculoSelected o dateSelected
  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  const unificarConductores = (resultados: any[]) => {
    return resultados.reduce((acc, resultado) => {
      const conductorKey = `${resultado.conductor.nombre} ${resultado.conductor.apellido}`;

      if (!acc[conductorKey]) {
        acc[conductorKey] = {
          conductor: resultado.conductor,
          bonos: {},
        };
      }

      resultado.bonosFiltrados.forEach((bonificacion: Bono) => {
        const totalQuantity = bonificacion.values.reduce(
          (sum, val) => sum + (val.quantity || 0),
          0
        );

        if (acc[conductorKey].bonos[bonificacion.name]) {
          // Sumar la cantidad y el valor total si el bono ya existe
          acc[conductorKey].bonos[bonificacion.name].quantity += totalQuantity;
          acc[conductorKey].bonos[bonificacion.name].totalValue +=
            totalQuantity * bonificacion.value;
        } else {
          // Si no existe, se agrega el bono
          acc[conductorKey].bonos[bonificacion.name] = {
            name: bonificacion.name,
            quantity: totalQuantity,
            totalValue: totalQuantity * bonificacion.value,
          };
        }
      });

      return acc;
    }, {});
  };

  // Utilizamos la función para unificar los conductores
  const resultadosUnificados = Object.values(unificarConductores(resultados));

  const totalBonos = resultadosUnificados.reduce(
    (totals: TotalesBonos, resultado: any) => {
      const bonoAlimentacion = resultado.bonos["Bono de alimentación"] || {
        quantity: 0,
      };
      const bonoTrabajado = resultado.bonos["Bono día trabajado"] || {
        quantity: 0,
      };
      const bonoTrabajadoDoble = resultado.bonos[
        "Bono día trabajado doble"
      ] || { quantity: 0 };

      // Acumular los totales
      totals.bonoAlimentacion += bonoAlimentacion.quantity;
      totals.bonoTrabajado += bonoTrabajado.quantity;
      totals.bonoTrabajadoDoble += bonoTrabajadoDoble.quantity;

      return totals;
    },
    {
      bonoAlimentacion: 0,
      bonoTrabajado: 0,
      bonoTrabajadoDoble: 0,
    } as TotalesBonos // Inicialización de los totales
  );

  const filtrarResultadosConBonos = (resultadosUnificados: any) => {
    return resultadosUnificados
      ?.filter((resultado: any) => {
        const bonoAlimentacion = resultado.bonos["Bono de alimentación"] || {
          quantity: 0,
        };
        const bonoTrabajado = resultado.bonos["Bono día trabajado"] || {
          quantity: 0,
        };
        const bonoTrabajadoDoble = resultado.bonos[
          "Bono día trabajado doble"
        ] || { quantity: 0 };

        // Filtrar aquellos cuyo quantity sea mayor que 0
        return (
          bonoAlimentacion.quantity > 0 ||
          bonoTrabajado.quantity > 0 ||
          bonoTrabajadoDoble.quantity > 0
        );
      })
      ?.map((resultado: any) => {
        const bonoAlimentacion = resultado.bonos["Bono de alimentación"] || {
          quantity: 0,
        };
        const bonoTrabajado = resultado.bonos["Bono día trabajado"] || {
          quantity: 0,
        };
        const bonoTrabajadoDoble = resultado.bonos[
          "Bono día trabajado doble"
        ] || { quantity: 0 };

        return {
          conductor: `${resultado.conductor.nombre} ${resultado.conductor.apellido}`,
          bonoAlimentacion: bonoAlimentacion.quantity,
          bonoTrabajado: bonoTrabajado.quantity,
          bonoTrabajadoDoble: bonoTrabajadoDoble.quantity,
        };
      });
  };

  const isMobile = useMediaQuery("(max-width: 960px)"); // Tailwind `sm` breakpoint

  return (
    <div className="max-md:px-3 xl:w-2/3 mx-auto flex flex-col gap-10">
      <div className="space-y-5 flex flex-col items-center w-full">
        <h2 className="font-bold text-2xl text-green-700">
          Filtrar Liquidaciones
        </h2>
        <div className="space-y-3 w-full md:w-1/2 flex flex-col items-center">
          <SelectReact
            className="w-full"
            options={vehiculosOptions}
            value={vehiculoSelected}
            onChange={(selectedOption) => handleVehiculoSelect(selectedOption)}
            placeholder="Seleccione la placa"
            isSearchable
            styles={selectStyles}
          />
          <Select
            label="Selecciona un mes"
            onChange={(e) => setMesSelected(e.target.value)}
          >
            {mesesDelAño.map((mes) => (
              <SelectItem key={mes.value} value={mes.value}>
                {mes.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
      {vehiculoSelected &&
        mesSelected &&
        (isMobile ? (
          // Acordeón para dispositivos móviles
          <Card>
            <CardHeader className="flex gap-3">
              <div className="flex flex-col">
                <p className="text-xl text-green-700 font-bold">
                  {vehiculoSelected.label}
                </p>
                <p className="text-md text-default-500">
                  {mesesDelAño[Number(mesSelected)]?.label}
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody>
              {(() => {
                const resultadosFiltrados =
                  filtrarResultadosConBonos(resultadosUnificados);

                if (resultadosFiltrados.length > 0) {
                  return (
                    <div className="space-y-5">
                      {resultadosFiltrados.map(
                        (resultado: any, index: number) => (
                          <div
                            className={`${index % 2 === 0 ? "" : "bg-default-100"} p-3 rounded-xl shadow-md`}
                            key={index}
                          >
                            <p className="text-sm md:text-medium font-bold">
                              {resultado.conductor}
                            </p>
                            <div className="flex justify-between items-center">
                              <p>Bono de alimentación</p>
                              <p className="text-center">
                                {resultado.bonoAlimentacion}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p>Bono de día trabajado</p>
                              <p className="text-center">
                                {resultado.bonoTrabajado}
                              </p>
                            </div>
                            <div className="flex justify-between items-center">
                              <p>Bono de día trabajado doble</p>
                              <p className="text-center">
                                {resultado.bonoTrabajadoDoble}
                              </p>
                            </div>
                          </div>
                        )
                      )}
                      <Divider />
                      <div
                        className="bg-green-700 p-3 rounded-xl text-white"
                        key="totals"
                      >
                        <p>
                          <strong>Total</strong>
                        </p>
                        <div className="flex justify-between items-center">
                          <p>Bono de alimentación</p>
                          <p className="text-center">
                            <strong>
                              {resultadosFiltrados?.reduce(
                                (total: number, resultado: any) =>
                                  total + resultado.bonoAlimentacion,
                                0
                              )}
                            </strong>
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p>Bono de día trabajado</p>
                          <p className="text-center">
                            <strong>
                              {resultadosFiltrados?.reduce(
                                (total: number, resultado: any) =>
                                  total + resultado.bonoTrabajado,
                                0
                              )}
                            </strong>
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p>Bono de día trabajado doble</p>
                          <p className="text-center">
                            <strong>
                              {resultadosFiltrados.reduce(
                                (total: number, resultado: any) =>
                                  total + resultado.bonoTrabajadoDoble,
                                0
                              )}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <p>No hay resultados</p>
                  )
                }
              })()}
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="mx-auto text-center">
              <h2 className="text-xl font-bold">{vehiculoSelected.label}</h2>
              <h3 className="text-xl text-default-500">
                {mesesDelAño[Number(mesSelected)]?.label}
              </h3>
            </div>
            <Table
              className="-mt-5"
              aria-label="Liquidaciones filtradas"
            >
              <TableHeader>
                <TableColumn className="bg-green-700 text-white uppercase">
                  Conductor
                </TableColumn>
                <TableColumn className="bg-green-700 text-white uppercase">
                  Bono de alimentación
                </TableColumn>
                <TableColumn className="bg-green-700 text-white uppercase">
                  Bono día trabajado
                </TableColumn>
                <TableColumn className="bg-green-700 text-white uppercase">
                  Bono día trabajado doble
                </TableColumn>
              </TableHeader>
              <TableBody emptyContent={"No hay resultados por mostrar."}>
                {[
                  ...resultadosUnificados
                    ?.filter((resultado: any) => {
                      const bonoAlimentacion = resultado.bonos[
                        "Bono de alimentación"
                      ] || { quantity: 0 };
                      const bonoTrabajado = resultado.bonos[
                        "Bono día trabajado"
                      ] || { quantity: 0 };
                      const bonoTrabajadoDoble = resultado.bonos[
                        "Bono día trabajado doble"
                      ] || { quantity: 0 };

                      // Filtrar aquellos cuyo quantity sea mayor que 0
                      return (
                        bonoAlimentacion.quantity > 0 ||
                        bonoTrabajado.quantity > 0 ||
                        bonoTrabajadoDoble.quantity > 0
                      );
                    })
                    ?.map((resultado: any, index: number) => {
                      const bonoAlimentacion = resultado.bonos[
                        "Bono de alimentación"
                      ] || { quantity: 0 };
                      const bonoTrabajado = resultado.bonos[
                        "Bono día trabajado"
                      ] || { quantity: 0 };
                      const bonoTrabajadoDoble = resultado.bonos[
                        "Bono día trabajado doble"
                      ] || { quantity: 0 };

                      return (
                        <TableRow
                          className={`${index % 2 === 0 ? "" : "bg-default-100"}`}
                          key={index}
                        >
                          <TableCell>{`${resultado.conductor.nombre} ${resultado.conductor.apellido}`}</TableCell>
                          <TableCell className="text-center">
                            {bonoAlimentacion.quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {bonoTrabajado.quantity}
                          </TableCell>
                          <TableCell className="text-center">
                            {bonoTrabajadoDoble.quantity}
                          </TableCell>
                        </TableRow>
                      );
                    }),
                  // Pie de tabla con los totales
                  <TableRow className="uppercase" key="totals">
                    <TableCell>
                      <strong>Total</strong>
                    </TableCell>
                    <TableCell className="text-center">
                      <strong>{totalBonos.bonoAlimentacion}</strong>
                    </TableCell>
                    <TableCell className="text-center">
                      <strong>{totalBonos.bonoTrabajado}</strong>
                    </TableCell>
                    <TableCell className="text-center">
                      <strong>{totalBonos.bonoTrabajadoDoble}</strong>
                    </TableCell>
                  </TableRow>,
                ]}
              </TableBody>
            </Table>
          </>
        ))}
    </div>
  );
}
