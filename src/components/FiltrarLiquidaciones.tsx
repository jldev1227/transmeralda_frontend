import { mesesDelAño } from "@/data/meses";
import useLiquidacion from "@/hooks/useLiquidacion";
import { selectStyles } from "@/styles/selectStyles";
import { Bono, Conductor, Mantenimiento, Recargo, VehiculoOption } from "@/types";
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
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
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

        const mantenimientos = liquidacion?.mantenimientos
          ?.flatMap((bono) => {
            // Filtrar solo aquellos bonos que coincidan con el vehiculoSelected.value
            if (bono.vehiculoId === vehiculoSelected.value) {
              const valuesFiltrados = bono.values.filter(
                (value) => value.mes === mesesDelAño[Number(mesSelected)]?.label
              );

              if (valuesFiltrados.length > 0) {
                return {
                  id: bono.id ?? "",
                  value: bono.value,
                  values: valuesFiltrados,
                  vehiculoId: bono.vehiculoId,
                };
              }
            }

            return undefined; // Retornamos undefined si no pasa el filtro de vehiculoId
          })
          ?.filter(Boolean) as Mantenimiento[]; // Filtramos los undefined y garantizamos que sea Bono[]

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
          mantenimientos,
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
          mantenimientos: [],
          recargos: [],
        };
      }

      // Pasar los recargos al conductor existente
      resultado.recargos.forEach((recargo: Recargo) => {
        acc[conductorKey].recargos.push(recargo);
      });

      // Pasar los recargos al conductor existente
      resultado.mantenimientos.forEach((recargo: Recargo) => {
        acc[conductorKey].mantenimientos.push(recargo);
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

      // Filtrar conductores que no cumplan con la condición de bonos
      const tieneBonosValidos = Object.values(acc[conductorKey].bonos).some(
        (bono: any) => bono.quantity > 0
      );

      // Filtrar conductores que no cumplan con la condición de mantenimientos
      const tieneMantenimientos = Object.values(acc[conductorKey].mantenimientos).some(
        (mantenimiento: any) => mantenimiento.values.filter((value: any) => value.quantity > 0)
      );

      // Filtrar conductores que no cumplan con la condición de recargos
      const tieneRecargosValidos = acc[conductorKey].recargos.length > 0;

      if (!tieneBonosValidos && !tieneMantenimientos && !tieneRecargosValidos) {
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

  const totalValorBono = resultadosUnificados.reduce(
    (total : number, resultado: any) => {
      const bonoAlimentacion = resultado.bonos["Bono de alimentación"] || {
        totalValue: 0,
      };

      return total + bonoAlimentacion.totalValue
    },
    0
  );

  const totalMantenimientos = resultadosUnificados.reduce(
    (total: number, resultado: any) => {
      const sumaCantidadMantenimientos = resultado.mantenimientos.reduce(
        (suma: number, mantenimiento: any) => {
          return (
            suma +
            mantenimiento.values.reduce(
              (totalValue: number, value: any) => totalValue + value.quantity,
              0
            )
          );
        },
        0
      );

      // Acumular la suma de mantenimientos al total general
      return total + sumaCantidadMantenimientos;
    },
    0 // Inicialización del total como número
  );

  const totalMantenimientosValor = resultadosUnificados.reduce(
    (total: number, resultado: any) => {
      const sumaCantidadMantenimientos = resultado.mantenimientos.reduce(
        (suma: number, mantenimiento: any) => {
          return (
            suma +
            (mantenimiento.values.reduce(
              (totalValue: number, value: any) => totalValue + value.quantity,
              0
            ) * mantenimiento.value)
          );
        },
        0
      );

      // Acumular la suma de mantenimientos al total general
      return total + sumaCantidadMantenimientos;
    },
    0 // Inicialización del total como número
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

  const cantidadRecargos = resultadosUnificados?.reduce(
    (total: number, resultado: any) => {
      // Sumar el valor de cada recargo del array de recargos

      // Acumular la suma de recargos al total general
      return total + resultado.recargos.length;
    },
    0
  )
  

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
          resultado.mantenimientos.length > 0 ||
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

        const mantenimientosTotales = resultado.mantenimientos.reduce((total: number, mantenimiento: Mantenimiento) => {
          return total + mantenimiento.values[0].quantity
        }, 0)

        return {
          conductor: `${resultado.conductor.nombre} ${resultado.conductor.apellido}`,
          bonoAlimentacion: bonoAlimentacion.quantity,
          bonoTrabajado: bonoTrabajado.quantity,
          bonoTrabajadoDoble: bonoTrabajadoDoble.quantity,
          mantenimientosTotales,
          totalRecargos,
          totalServicios,
        };
      });
  };

  const isMobile = useMediaQuery("(max-width: 960px)"); // Tailwind `sm` breakpoint


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
                <p className="text-md text-default-300">
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
              <h3 className="text-xl text-default-300">
                {mesesDelAño[Number(mesSelected)]?.label}
              </h3>
            </div>

            {resultadosUnificados.length > 0 ? (
              <>
                {resultadosUnificados?.map((resultado: any, index: number) => {
                  const { nombre, apellido, cc } = resultado?.conductor;

                  const totalMantenimientoQuantity = resultado.mantenimientos.reduce((acc: any, mantenimiento: Mantenimiento) => {
                    acc += mantenimiento.values[0].quantity;
                    // Puedes agregar otras propiedades si las necesitas acumular también
                    return acc;
                  }, 0);


                  const totalMantenimientoValor = resultado.mantenimientos.reduce((acc: number, mantenimiento: Mantenimiento) => {
                    // Suponiendo que el valor y la cantidad están en el mismo índice
                    const cantidad = mantenimiento.values[0].quantity;
                    const valor = mantenimiento.value;
                    return acc + (cantidad * valor);
                  }, 0);

                  return (
                    <Card key={index}>
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
                          {Object.values(resultado.bonos).some((bono: any) => bono.quantity > 0) ? (
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
                                  (bono: any, index: number) => (
                                    <tr key={index}>
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
                          <h2 className="text-xl font-semibold">Mantenimientos</h2>
                          {resultado.mantenimientos.some((mantenimiento: any) =>
                            mantenimiento.values.some((value: any) => value.quantity > 0)
                          ) ? (
                            <table className="table-auto w-full text-sm mb-5">
                              <thead className="bg-default-500 text-white">
                                <tr>
                                  <th className="px-4 py-2 text-center">Cantidad</th>
                                  <th className="px-4 py-2 text-center">Valor unitario</th>
                                  <th className="px-4 py-2 text-center">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr>
                                  <td className="border px-4 py-2 text-center">{totalMantenimientoQuantity}</td>
                                  <td className="border px-4 py-2 text-center">{formatToCOP(totalMantenimientoValor / totalMantenimientoQuantity)}</td>
                                  <td className="border px-4 py-2 text-center text-green-500">{formatToCOP(totalMantenimientoValor)}</td>
                                </tr>
                              </tbody>
                            </table>
                          ) : (
                            <p>No hay mantenimientos para mostrar</p>
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

                <Card>
                  <CardHeader>
                    Descontar al propietario
                  </CardHeader>
                  <Divider />
                  <CardBody>
                    <Table isCompact>
                      <TableHeader>
                        <TableColumn className="bg-black text-white">CONCEPTO</TableColumn>
                        <TableColumn className="bg-black text-white">CANTIDAD</TableColumn>
                        <TableColumn className="bg-black text-white">VALOR</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow key="1">
                          <TableCell>Alimentación</TableCell>
                          <TableCell>{totalBonos.bonoAlimentacion}</TableCell>
                          <TableCell>
                            {formatToCOP(totalValorBono)}
                          </TableCell>
                        </TableRow>
                        <TableRow key="2">
                          <TableCell>Recargos</TableCell>
                          <TableCell>{cantidadRecargos}</TableCell>
                          <TableCell>
                            {formatToCOP(totalRecargos)}
                          </TableCell>
                        </TableRow>
                        <TableRow key="3">
                          <TableCell>Mantenimientos</TableCell>
                          <TableCell>{totalMantenimientos}</TableCell>
                          <TableCell>
                            {formatToCOP(totalMantenimientosValor)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                    <CardFooter>
                      <p className="font-semibold text-xl">Días trabajados del vehículo:{" "}
                        <span className="font-normal">{totalBonos.total}</span>
                      </p>
                    </CardFooter>
                  </CardBody>
                </Card>
              </>
            ) : (
              <p className="text-medium">No resultados para mostrar</p>
            )}
          </>
        ))}
    </div>
  );
}
