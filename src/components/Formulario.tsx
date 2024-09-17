import { Input } from "@nextui-org/input";
import { DateRangePicker, DateValue, RangeValue } from "@nextui-org/react";
import SelectReact, { SingleValue } from "react-select";
import { Divider } from "@nextui-org/divider";
import { Checkbox } from "@nextui-org/checkbox";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { conductores, vehiculos, empresas } from "@/data/index";
import { useMemo, useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { formatToCOP, formatDate } from "@/helpers";
import {
  Pernote,
  Recargo,
  DetalleVehiculo,
  Liquidacion,
  ConductorOption,
  VehiculoOption,
} from "@/types/index";
// Definición de tipos

export default function Formulario() {
  const [conductorSelected, setConductorSelected] =
    useState<SingleValue<ConductorOption>>(null);
  const [vehiculosSelected, setVehiculosSelected] = useState<VehiculoOption[]>(
    []
  );
  const [dateSelected, setDateSelected] =
    useState<RangeValue<DateValue> | null>(null);
  const [detallesVehiculos, setDetallesVehiculos] = useState<DetalleVehiculo[]>(
    []
  );
  const [liquidacion, setLiquidacion] = useState<Liquidacion>();
  const [isCheckedAjuste, setIsCheckedAjuste] = useState(false);
  const [diasLaborados, setDiasLaborados] = useState(0);

  // Opciones para selectores
  const conductoresOptions = useMemo(
    () =>
      conductores.map((conductor) => ({
        value: conductor.id,
        label: `${conductor.nombre} ${conductor.apellido}`,
      })),
    []
  );

  const vehiculosOptions = useMemo(
    () =>
      vehiculos.map((vehiculo) => ({
        value: vehiculo.id,
        label: vehiculo.placa,
      })),
    []
  );

  const empresasOptions = useMemo(
    () =>
      empresas.map((empresa) => ({
        value: empresa.NIT,
        label: empresa.Nombre,
      })),
    []
  );

  // Manejadores de eventos
  const handleVehiculoSelect = useCallback(
    (selected: VehiculoOption[]) => {
      setVehiculosSelected(selected);
      setDetallesVehiculos(
        selected.map((vehiculo) => {
          const detalleExistente = detallesVehiculos.find(
            (detalle) => detalle.vehiculo.value === vehiculo.value
          );
          return (
            detalleExistente || {
              vehiculo,
              bonos: [
                { name: "Bono de alimentación", quantity: 0, value: 22960 },
                { name: "Bono día trabajado", quantity: 0, value: 13000 },
                { name: "Bono día trabajado doble", quantity: 0, value: 25000 },
              ],
              pernotes: [],
              recargos: [],
            }
          );
        })
      );
    },
    [detallesVehiculos]
  );

  const handleBonoChange = useCallback(
    (vehiculoId: string, name: string, quantity: number) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                bonos: detalle.bonos.map((bono) =>
                  bono.name === name ? { ...bono, quantity } : bono
                ),
              }
            : detalle
        )
      );
    },
    []
  );

  const handlePernoteChange = useCallback(
    (
      vehiculoId: string,
      index: number,
      field: keyof Pernote,
      value: string | number
    ) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                pernotes: detalle.pernotes.map((pernote, i) =>
                  i === index ? { ...pernote, [field]: value } : pernote
                ),
              }
            : detalle
        )
      );
    },
    []
  );

  const handleRecargoChange = useCallback(
    (
      vehiculoId: string,
      index: number,
      field: keyof Recargo,
      value: string | number
    ) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                recargos: detalle.recargos.map((recargo, i) =>
                  i === index ? { ...recargo, [field]: value } : recargo
                ),
              }
            : detalle
        )
      );
    },
    []
  );

  const handleAddPernote = useCallback((vehiculoId: string) => {
    setDetallesVehiculos((prevDetalles) =>
      prevDetalles.map((detalle) =>
        detalle.vehiculo.value === vehiculoId
          ? {
              ...detalle,
              pernotes: [...detalle.pernotes, { empresa: "", cantidad: 0 }],
            }
          : detalle
      )
    );
  }, []);

  const handleAddRecargo = useCallback((vehiculoId: string) => {
    setDetallesVehiculos((prevDetalles) =>
      prevDetalles.map((detalle) =>
        detalle.vehiculo.value === vehiculoId
          ? {
              ...detalle,
              recargos: [...detalle.recargos, { empresa: "", valor: 0 }],
            }
          : detalle
      )
    );
  }, []);

  const handleRemovePernote = useCallback(
    (vehiculoId: string, index: number) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                pernotes: detalle.pernotes.filter((_, i) => i !== index),
              }
            : detalle
        )
      );
    },
    []
  );

  const handleRemoveRecargo = useCallback(
    (vehiculoId: string, index: number) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                recargos: detalle.recargos.filter((_, i) => i !== index),
              }
            : detalle
        )
      );
    },
    []
  );

  const bonificacionVillanueva = useMemo(() => {
    if (isCheckedAjuste) {
      const conductor = conductores.find(
        (c) => c.id === liquidacion?.conductor?.value
      );
      return conductor
        ? ((2101498 - conductor.salarioBase) / 30) * diasLaborados
        : 0;
    }
    return 0;
  }, [isCheckedAjuste, liquidacion, diasLaborados]);

  const { auxilioTransporte, salarioBaseConductor, sueldoTotal, totalPernotes, totalBonificaciones, totalRecargos } =
    useMemo(() => {
      const total = detallesVehiculos.reduce(
        (acc, item) => {
          const bonos = item.bonos.reduce(
            (total, bono) => total + bono.quantity * bono.value,
            0
          );
          const pernotes = item.pernotes.reduce(
            (total, pernote) => total + pernote.cantidad * 100906,
            0
          );
          const recargos = item.recargos.reduce(
            (total, recargo) => total + recargo.valor,
            0
          );


          return {
            totalBonos: acc.totalBonos + bonos,
            totalPernotes: acc.totalPernotes + pernotes,
            totalRecargos: acc.totalRecargos + recargos,
            totalSubtotales: acc.totalSubtotales + bonos + pernotes + recargos,
          };
        },
        {
          totalBonos: 0,
          totalPernotes: 0,
          totalRecargos: 0,
          totalSubtotales: 0,
        }
      );

      const salarioBaseConductor =  conductores.find((conductorState) => conductorState.id === conductorSelected?.value)?.salarioBase || 0
      const auxilioTransporte = 162000

      return {
        auxilioTransporte,
        salarioBaseConductor,
        totalBonificaciones: total.totalBonos,
        totalPernotes: total.totalPernotes,
        totalRecargos: total.totalRecargos,
        sueldoTotal: total.totalSubtotales + bonificacionVillanueva + salarioBaseConductor + auxilioTransporte,
      };
    }, [detallesVehiculos, bonificacionVillanueva]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#f4f4f5",
      border: "none",
      borderRadius: "8px",
      padding: "8px",
      boxShadow: "none",
      "&:hover": {
        backgroundColor: "#e4e4e7",
      },
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? "#D1F4E0" : "white",
      color: state.isSelected ? "black" : "black",
      "&:hover": {
        backgroundColor: "#e6f7ff",
      },
      opacity: 1,
      zIndex: 10,
    }),
    menu: (provided: any) => ({
      ...provided,
      borderRadius: "8px",
      marginTop: "4px",
      zIndex: 100,
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#333",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#999",
    }),
  };

  useEffect(() => {
    const nuevaLiquidacion: Liquidacion = {
      id: uuidv4(),
      conductor: conductorSelected,
      detallesVehiculos: detallesVehiculos.map((detalle) => ({
        vehiculo: detalle.vehiculo,
        bonos: detalle.bonos,
        pernotes: detalle.pernotes,
        recargos: detalle.recargos,
      })),
    };

    setLiquidacion(nuevaLiquidacion);
  }, [conductorSelected, detallesVehiculos]);

  const addLiquidacion = () => {
    console.log({
      bonificacionVillanueva,
      sueldoTotal,
      totalBonificaciones,
      totalPernotes,
      totalRecargos,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <form className="w-full flex flex-col space-y-8">
        {/* Conductor y Placa */}
        <div className="space-y-4 flex flex-col">
          <h2 className="font-semibold mb-3">Conductor y vehiculo</h2>
          <SelectReact
            options={conductoresOptions}
            value={conductorSelected}
            onChange={setConductorSelected}
            placeholder="Seleccione un conductor"
            isSearchable
            styles={customStyles}
          />
          <SelectReact
            options={vehiculosOptions}
            value={vehiculosSelected}
            onChange={(selectedOptions) =>
              handleVehiculoSelect(selectedOptions)
            }
            placeholder="Seleccione una o más placas"
            isMulti
            isSearchable
            styles={customStyles}
          />
          <DateRangePicker
            onChange={setDateSelected}
            label="Periodo a liquidar"
          />

          {detallesVehiculos &&
            dateSelected &&
            detallesVehiculos.map((detalleVehiculo, index) => (
              <div key={index}>
                <div className="space-y-4 flex flex-col">
                  <h2 className="text-xl font-semibold mb-3">
                    Vehículo: {detalleVehiculo.vehiculo.label}
                  </h2>
                  <h3 className="font-semibold mb-2">Bonos</h3>
                  {detalleVehiculo.bonos.map((bono) => (
                    <Input
                      key={bono.name}
                      type="number"
                      label={`${bono.name} ($${bono.value.toLocaleString()})`}
                      placeholder={`Ingresa la cantidad de ${bono.name.toLowerCase()}`}
                      value={bono.quantity.toString()}
                      onChange={(e) =>
                        handleBonoChange(
                          detalleVehiculo.vehiculo.value,
                          bono.name,
                          +e.target.value
                        )
                      }
                    />
                  ))}
                  <h3 className="font-semibold mb-2">Pernotes</h3>
                  {detalleVehiculo.pernotes.map((pernote, pernoteIndex) => (
                    <div key={pernoteIndex} className="grid grid-cols-5 gap-4">
                      <SelectReact
                        options={empresasOptions}
                        value={
                          empresasOptions.find(
                            (option) => option.value === pernote.empresa
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handlePernoteChange(
                            detalleVehiculo.vehiculo.value,
                            pernoteIndex,
                            "empresa",
                            selectedOption?.value || ""
                          )
                        }
                        placeholder="Selecciona una empresa"
                        isSearchable
                        styles={customStyles}
                        className="col-span-3"
                      />
                      <Input
                        type="number"
                        label="Cantidad"
                        placeholder="0"
                        className="col-span-1"
                        value={pernote.cantidad.toString()}
                        onChange={(e) =>
                          handlePernoteChange(
                            detalleVehiculo.vehiculo.value,
                            pernoteIndex,
                            "cantidad",
                            +e.target.value
                          )
                        }
                      />
                      <Button
                        onClick={() =>
                          handleRemovePernote(
                            detalleVehiculo.vehiculo.value,
                            pernoteIndex
                          )
                        }
                        className="m-auto bg-red-300 text-white max-sm:col-span-5 max-sm:w-full"
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      handleAddPernote(detalleVehiculo.vehiculo.value)
                    }
                    className="bg-green-100"
                  >
                    Añadir pernote
                  </Button>
                  <h3 className="font-semibold mb-2">Recargos</h3>
                  {detalleVehiculo.recargos.map((recargo, recargoIndex) => (
                    <div key={recargoIndex} className="grid grid-cols-5 gap-4">
                      <SelectReact
                        options={empresasOptions}
                        value={
                          empresasOptions.find(
                            (option) => option.value === recargo.empresa
                          ) || null
                        }
                        onChange={(selectedOption) =>
                          handleRecargoChange(
                            detalleVehiculo.vehiculo.value,
                            recargoIndex,
                            "empresa",
                            selectedOption?.value || ""
                          )
                        }
                        placeholder="Selecciona una empresa"
                        isSearchable
                        styles={customStyles}
                        className="col-span-3"
                      />
                      <Input
                        type="number"
                        label="Valor"
                        placeholder="$0"
                        className="col-span-1"
                        value={recargo.valor.toString()}
                        onChange={(e) =>
                          handleRecargoChange(
                            detalleVehiculo.vehiculo.value,
                            recargoIndex,
                            "valor",
                            +e.target.value
                          )
                        }
                      />
                      <Button
                        onClick={() =>
                          handleRemoveRecargo(
                            detalleVehiculo.vehiculo.value,
                            recargoIndex
                          )
                        }
                        className="m-auto bg-red-300 text-white max-sm:col-span-5 max-sm:w-full"
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      handleAddRecargo(detalleVehiculo.vehiculo.value)
                    }
                    className="bg-green-100"
                  >
                    Añadir recargo
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </form>
      <div className="w-full">
        {liquidacion?.detallesVehiculos && dateSelected && vehiculos && (
          <>
            <ConductorInfo
              conductor={conductores.find(
                (c) => c.id === liquidacion.conductor?.value
              )}
              dateSelected={dateSelected}
            />
            {liquidacion.detallesVehiculos.map((detalle, index) => (
              <CardLiquidacion key={index} detalleVehiculo={detalle} />
            ))}
          </>
        )}
        {liquidacion?.detallesVehiculos && dateSelected && vehiculos && (
          <Card>
            <CardHeader>
              <p className="text-xl font-semibold">Resumen</p>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <Checkbox
                isSelected={isCheckedAjuste}
                onChange={(e) => setIsCheckedAjuste(e.target.checked)}
              >
                Bonificación Villanueva
              </Checkbox>
              {isCheckedAjuste && (
                <>
                  <Input
                    value={diasLaborados.toString()}
                    onChange={(e) => setDiasLaborados(+e.target.value)}
                    type="number"
                    label="Cantidad días laborados"
                    placeholder="Ingresa la cantidad de días laborados"
                    className="max-w-xs"
                  />
                  <div>
                    <p>Bonificación villanueva</p>
                    <p>{formatToCOP(bonificacionVillanueva)}</p>
                  </div>
                </>
              )}
              <div>
                <p>Salario base:</p>
                <p>
                  {formatToCOP(salarioBaseConductor)}
                </p>
              </div>
              <div>
                <p>Auxilio transporte:</p>
                <p>
                  {formatToCOP(auxilioTransporte)}
                </p>
              </div>
              <div>
                <p>Salario total:</p>
                <p>{formatToCOP(sueldoTotal)}</p>
              </div>
            </CardBody>
            <Divider />
            <CardFooter>
              <Button
                onPress={addLiquidacion}
                className="w-full bg-green-700 text-white"
              >
                Agregar liquidación
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}

const ConductorInfo = ({ conductor, dateSelected }) => {
  if (!conductor) return null;
  return (
    <div className="mb-5">
      <h1 className="text-center text-2xl font-bold">{`${conductor.nombre} ${conductor.apellido}`}</h1>
      <p className="text-center">C.C. {conductor.cc}</p>
      <h2 className="text-center">
        {formatDateRange(dateSelected?.start)} -{" "}
        {formatDateRange(dateSelected?.end)}
      </h2>
    </div>
  );
};

const formatDateRange = (datePart) => {
  if (!datePart) return "Fecha no disponible";
  return formatDate(datePart.day ?? 0, datePart.month ?? 0, datePart.year ?? 0);
};

const ListSection = ({ title, items, formatFn }) => (
  <div className="space-y-2">
    <h3 className="text-xl font-semibold">{title}</h3>
    <div>
      {items.map((item, index) => (
        <div key={index} className="grid grid-cols-5">
          {formatFn(item)}
        </div>
      ))}
    </div>
  </div>
);

const CardLiquidacion = ({ detalleVehiculo }) => {
  const totalBonos = useMemo(
    () =>
      detalleVehiculo.bonos.reduce(
        (total, bono) => total + bono.quantity * bono.value,
        0
      ),
    [detalleVehiculo.bonos]
  );
  const totalPernotes = useMemo(
    () =>
      detalleVehiculo.pernotes.reduce(
        (total, pernote) => total + pernote.cantidad * 100906,
        0
      ),
    [detalleVehiculo.pernotes]
  );
  const totalRecargos = useMemo(
    () =>
      detalleVehiculo.recargos.reduce(
        (total, recargo) => total + recargo.valor,
        0
      ),
    [detalleVehiculo.recargos]
  );
  const subtotal = totalBonos + totalPernotes + totalRecargos;

  return (
    <Card className="w-full mb-5">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md text-foreground-500">
            Vehículo: {detalleVehiculo.vehiculo.label}
          </p>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="gap-5">
        <ListSection
          title="Bonificaciones"
          items={detalleVehiculo.bonos}
          formatFn={(bono) => (
            <>
              <p className="col-span-3">
                {bono.name} ({formatToCOP(bono.value)}) :
              </p>
              <p className="text-right text-primary-500">{bono.quantity}</p>
              <p className="text-right text-green-500">
                {formatToCOP(bono.quantity * bono.value)}
              </p>
            </>
          )}
        />
        <ListSection
          title="Pernotes"
          items={detalleVehiculo.pernotes}
          formatFn={(pernote) => {
            const empresa = empresas.find(
              (empresa) => empresa.NIT === pernote.empresa
            );
            return (
              <>
                <p className="col-span-3 text-md">{empresa?.Nombre}</p>
                <p className="text-right text-primary-500">
                  {pernote.cantidad}
                </p>
                <p className="text-right text-green-500">
                  {formatToCOP(pernote.cantidad * 100906)}
                </p>
              </>
            );
          }}
        />
        <ListSection
          title="Recargos"
          items={detalleVehiculo.recargos}
          formatFn={(recargo) => {
            const empresa = empresas.find(
              (empresa) => empresa.NIT === recargo.empresa
            );
            return (
              <>
                <p className="col-span-4 text-md">{empresa?.Nombre}</p>
                <p className="text-right text-green-500">
                  {formatToCOP(recargo.valor)}
                </p>
              </>
            );
          }}
        />
      </CardBody>
      <Divider />
      <CardFooter className="w-full space-y-5 flex flex-col">
        <SummaryRow
          label="Total bonificaciones"
          value={formatToCOP(totalBonos)}
        />
        <SummaryRow label="Total pernotes" value={formatToCOP(totalPernotes)} />
        <SummaryRow label="Total recargos" value={formatToCOP(totalRecargos)} />
        <Divider />
        <div className="w-full flex justify-between text-2xl">
          <p className="font-semibold">Subtotal: </p>
          <p className="text-secondary-500 font-semibold">
            {formatToCOP(subtotal)}
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};

const SummaryRow = ({ label, value }) => (
  <div className="w-full flex justify-between">
    <p className="font-semibold">{label}: </p>
    <p className="text-yellow-500">{value}</p>
  </div>
);
