import { mesesDelAño } from "@/data/meses";
import useLiquidacion from "@/hooks/useLiquidacion";
import { selectStyles } from "@/styles/selectStyles";
import { Bono, Conductor, Recargo, VehiculoOption } from "@/types";
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
import { formatToCOP } from "@/helpers";
interface Resultado {
  conductor?: Conductor;
  bonos?: Bono[];
  recargos?: Recargo[];
}

interface TotalesBonos {
  bonoAlimentacion: number;
  bonoTrabajado: number;
  bonoTrabajadoDoble: number;
  total: number;
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
        const bonos = liquidacion?.bonificaciones
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
                  vehiculoId: bono.vehiculoId,
                };
              }
            }

            return undefined; // Retornamos undefined si no pasa el filtro de vehiculoId
          })
          ?.filter(Boolean) as Bono[]; // Filtramos los undefined y garantizamos que sea Bono[]

        const recargos = liquidacion.recargos
          ?.flatMap((recargo) => {
            if (recargo.vehiculoId === vehiculoSelected.value) {
              if (
                recargo.mes === mesesDelAño[Number(mesSelected)]?.label &&
                !recargo.pagCliente
              ) {
                return recargo;
              }
            }

            return undefined;
          })
          ?.filter(Boolean) as Recargo[];

        // Retornar el objeto con conductor y bonos filtrados
        return {
          conductor: liquidacion.conductor, // O la información relevante del conductor
          bonos,
          recargos,
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
          recargos: [],
        };
      }
  
      // Pasar los recargos al conductor existente
      resultado.recargos.forEach((recargo: Recargo) => {
        acc[conductorKey].recargos.push(recargo);
      });
  
      // Proceso de los bonos
      resultado.bonos.forEach((bonificacion: Bono) => {
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
  
      // Filtrar conductores que no cumplan con la condición de recargos y bonos
      const tieneBonosValidos = Object.values(acc[conductorKey].bonos).some(
        (bono: any) => bono.quantity > 0
      );

      const tieneRecargosValidos = acc[conductorKey].recargos.length > 0;
      
      if (!tieneBonosValidos && !tieneRecargosValidos) {
        delete acc[conductorKey]; // Eliminar del acumulador si no cumple con la condición
      }
  
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
      totals.total =
        totals.bonoAlimentacion +
        totals.bonoTrabajado +
        totals.bonoTrabajadoDoble;

      return totals;
    },
    {
      bonoAlimentacion: 0,
      bonoTrabajado: 0,
      bonoTrabajadoDoble: 0,
      total: 0,
    } as TotalesBonos // Inicialización de los totales
  );

  const totalRecargos = resultadosUnificados?.reduce(
    (total: number, resultado: any) => {
      // Sumar el valor de cada recargo del array de recargos
      const sumaRecargos = resultado.recargos.reduce(
        (suma: number, recargo: any) => {
          return suma + recargo.valor;
        },
        0
      );

      // Acumular la suma de recargos al total general
      return total + sumaRecargos;
    },
    0
  );

  const filtrarResultados = (resultadosUnificados: any) => {
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
          bonoTrabajadoDoble.quantity > 0 ||
          resultado.recargos.length > 0
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

        const totalRecargos = resultado.recargos.reduce(
          (total: number, recargo: Recargo) => total + recargo.valor,
          0
        );

        const totalServicios =
          bonoAlimentacion.quantity +
          bonoTrabajado.quantity +
          bonoTrabajadoDoble.quantity;

        return {
          conductor: `${resultado.conductor.nombre} ${resultado.conductor.apellido}`,
          bonoAlimentacion: bonoAlimentacion.quantity,
          bonoTrabajado: bonoTrabajado.quantity,
          bonoTrabajadoDoble: bonoTrabajadoDoble.quantity,
          totalRecargos,
          totalServicios,
        };
      });
  };

  const isMobile = useMediaQuery("(max-width: 960px)"); // Tailwind `sm` breakpoint

  const renderFilas = () => {
    const resultados = filtrarResultados(resultadosUnificados);

    if (resultados.length === 0) {
      return []; // Devuelve un array vacío en lugar de null
    }

    // Mapea los resultados para generar las filas de la tabla
    const filas = resultados?.map((resultado: any, index: number) => (
      <TableRow className="border-2" key={index}>
        <TableCell className="border-r-2">{resultado.conductor}</TableCell>
        <TableCell className="text-center border-r-2">
          {resultado.bonoAlimentacion}
        </TableCell>
        <TableCell className="text-center border-r-2">
          {resultado.bonoTrabajado}
        </TableCell>
        <TableCell className="text-center border-r-2">
          {resultado.bonoTrabajadoDoble}
        </TableCell>
        <TableCell className="text-center bg-primary-700 text-white border-r-2">
          {formatToCOP(resultado.totalRecargos)}
        </TableCell>
        <TableCell className="text-center bg-primary-700 text-white border-r-2">
          {resultado.totalServicios}
        </TableCell>
      </TableRow>
    ));

    // Retorna todas las filas generadas
    return filas;
  };

  return (
    <div className="max-md:px-3 2xl:w-2/3 mx-auto flex flex-col gap-10 mt-10">
      <div className="space-y-10 flex flex-col items-center w-full">
        <h2 className="font-black text-2xl lg:text-4xl text-green-700">
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
              <div className="flex flex-1 flex-col items-center">
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
                const resultadosUnidos =
                  filtrarResultados(resultadosUnificados);

                if (resultadosUnidos.length > 0) {
                  return (
                    <div className="space-y-5">
                      {resultadosUnidos.map((resultado: any, index: number) => {
                        return (
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
                            <div className="flex justify-between items-center">
                              <p>Recargos</p>
                              <p className="text-center">
                                {formatToCOP(resultado.totalRecargos)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
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
                              {resultadosUnidos?.reduce(
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
                              {resultadosUnidos?.reduce(
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
                              {resultadosUnidos.reduce(
                                (total: number, resultado: any) =>
                                  total + resultado.bonoTrabajadoDoble,
                                0
                              )}
                            </strong>
                          </p>
                        </div>
                        <div className="flex justify-between items-center">
                          <p>Bono de día trabajado doble</p>
                          <p className="text-center">
                            <strong>
                              {formatToCOP(Number(totalRecargos))}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return <p>No hay resultados</p>;
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

            {resultadosUnificados.length > 0 ? (
              <>
                {resultadosUnificados?.map((resultado: any) => {
                  const { nombre, apellido, cc } = resultado?.conductor;

                  return (
                    <Card>
                      <CardHeader className="flex-col items-start font-semibold">
                        <p>
                          {nombre} {apellido}
                        </p>
                        <p className="text-foreground-500">C.C. {cc}</p>
                      </CardHeader>
                      <Divider />
                      <CardBody className="space-y-5">
                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold">Bonos</h2>
                          {Object.values(resultado.bonos).length > 0 ? (
                            <table className="table-auto w-full text-sm mb-5">
                              <thead className="bg-yellow-500 text-white">
                                <tr>
                                  <th className="px-4 py-2 text-left">
                                    Nombre del bono
                                  </th>
                                  <th className="px-4 py-2 text-center">
                                    Cantidad
                                  </th>
                                  <th className="px-4 py-2 text-center">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.values(resultado.bonos).map(
                                  (bono: any) => (
                                    <tr>
                                      <td className="border px-4 py-2">
                                        {bono.name}
                                      </td>
                                      <td className="border px-4 py-2 text-center">
                                        {bono.quantity}
                                      </td>
                                      <td className="border px-4 py-2 text-center text-green-500">
                                        {formatToCOP(bono.totalValue)}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          ) : (
                            <p>No hay bonos para mostrar</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h2 className="text-xl font-semibold">Recargos</h2>

                          {resultado.recargos.length > 0 ? (
                            <table className="table-auto w-full text-sm mb-5">
                              <thead className="bg-green-700 text-white">
                                <tr>
                                  <th className="px-4 py-2 text-left">
                                    Empresa
                                  </th>
                                  <th className="px-4 py-2 text-center">
                                    Paga
                                  </th>
                                  <th className="px-4 py-2 text-center">
                                    Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {resultado.recargos.map(
                                  (recargo: Recargo, index: number) => {
                                    const empresa = state.empresas.find(
                                      (empresa) =>
                                        empresa.NIT === recargo.empresa
                                    );

                                    return (
                                      <tr key={index}>
                                        <td className="border px-4 py-2">
                                          {empresa
                                            ? empresa.Nombre
                                            : "Empresa no encontrada"}
                                        </td>
                                        <td className="border px-4 py-2 text-center">
                                          {recargo.pagCliente
                                            ? "Cliente"
                                            : "Propietario"}
                                        </td>
                                        <td className="border px-4 py-2 text-center text-green-500">
                                          {formatToCOP(recargo.valor || 0)}
                                        </td>
                                      </tr>
                                    );
                                  }
                                )}
                              </tbody>
                            </table>
                          ) : (
                            <p>No hay recargos para mostrar</p>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}

                <Table className="-mt-5" aria-label="Liquidaciones filtradas">
                  <TableHeader>
                    <TableColumn className="bg-green-700 text-white uppercase border-r-2">
                      Conductor
                    </TableColumn>
                    <TableColumn className="text-center bg-green-700 text-white uppercase border-r-2">
                      Bono de alimentación
                    </TableColumn>
                    <TableColumn className="text-center bg-green-700 text-white uppercase border-r-2">
                      Bono día trabajado
                    </TableColumn>
                    <TableColumn className="text-center bg-green-700 text-white uppercase border-r-2">
                      Bono día trabajado doble
                    </TableColumn>
                    <TableColumn className="text-center bg-primary-700 text-white uppercase border-r-2">
                      Recargos totales
                    </TableColumn>
                    <TableColumn className="text-center bg-primary-700 text-white uppercase border-r-2">
                      Total servicios
                    </TableColumn>
                  </TableHeader>
                  <TableBody emptyContent={"No hay resultados por mostrar."}>
                    {renderFilas()}

                    <TableRow
                      className="uppercase bg-green-700 text-white"
                      key="totals"
                    >
                      <TableCell className="text-xl border-r-2">
                        <strong>Total</strong>
                      </TableCell>
                      <TableCell className="text-center text-xl border-r-2">
                        <strong>{totalBonos.bonoAlimentacion}</strong>
                      </TableCell>
                      <TableCell className="text-center text-xl border-r-2">
                        <strong>{totalBonos.bonoTrabajado}</strong>
                      </TableCell>
                      <TableCell className="text-center text-xl border-r-2">
                        <strong>{totalBonos.bonoTrabajadoDoble}</strong>
                      </TableCell>
                      <TableCell className="text-center text-xl bg-primary-700 border-r-2">
                        <strong>{formatToCOP(Number(totalRecargos))}</strong>
                      </TableCell>
                      <TableCell className="text-center text-xl bg-primary-700">
                        <strong>{totalBonos.total}</strong>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </>
            ) : (
              <p className="text-medium">No resultados para mostrar</p>
            )}
          </>
        ))}
    </div>
  );
}
