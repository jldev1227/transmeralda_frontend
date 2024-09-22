import { Input } from "@nextui-org/input";
import { DateRangePicker, DateValue, RangeValue } from "@nextui-org/react";
import SelectReact, { MultiValue, SingleValue } from "react-select";
import { Divider } from "@nextui-org/divider";
import { Checkbox } from "@nextui-org/checkbox";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { conductores, vehiculos, empresas } from "@/data/index";
import { useMemo, useState, useCallback, useEffect } from "react";
import { formatToCOP, formatDate } from "@/helpers";
import {
  Pernote,
  Recargo,
  DetalleVehiculo,
  LiquidacionInput,
  ConductorOption,
  VehiculoOption,
  Conductor,
} from "@/types/index";
import useLiquidacion from "@/hooks/useLiquidacion";
import {parseDate} from "@internationalized/date";

// Componente Formulario
export default function Formulario() {
  const { state, agregarLiquidacion } = useLiquidacion();
  const { liquidacion: stateLiquidacion } = state; // Obtenemos la liquidación del estado global

  const [conductorSelected, setConductorSelected] = useState<SingleValue<ConductorOption>>(null);
  const [vehiculosSelected, setVehiculosSelected] = useState<MultiValue<VehiculoOption>>([]);
  const [dateSelected, setDateSelected] = useState<RangeValue<DateValue> | null>(null);
  const [detallesVehiculos, setDetallesVehiculos] = useState<DetalleVehiculo[]>([]);
  const [liquidacion, setLiquidacion] = useState<LiquidacionInput | null>(null);
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

  useEffect(() => {
    if (stateLiquidacion) {
      // Actualizar conductor seleccionado
      const selectedConductor = conductoresOptions.find(
        (option) => option.value === stateLiquidacion.conductor.id
      );
      setConductorSelected(selectedConductor || null);


      setDetallesVehiculos(
        stateLiquidacion?.vehiculos?.map((vehiculo) => {
          const bonosDelVehiculo = stateLiquidacion.bonificaciones.filter(
            (bono) => bono.vehiculoId === vehiculo.id
          );

          const pernotesDelVehiculo = stateLiquidacion.pernotes.filter(
            (pernote) => pernote.vehiculoId === vehiculo.id
          );

          const recargosDelVehiculo = stateLiquidacion.recargos.filter(
            (recargo) => recargo.vehiculoId === vehiculo.id
          );

          const detalles = {
            vehiculo: {
              value: vehiculo.id,
              label: vehiculo.placa,
            },
            bonos: bonosDelVehiculo.length > 0 ? bonosDelVehiculo : [
              { name: "Bono de alimentación", quantity: 0, value: 22960 },
              { name: "Bono día trabajado", quantity: 0, value: 13000 },
              { name: "Bono día trabajado doble", quantity: 0, value: 25000 },
            ],
            pernotes: pernotesDelVehiculo.length > 0 ? pernotesDelVehiculo : {
              quantity: 0, value: 10000 
            }, // Puedes asignar pernotes si están en el stateLiquidacion
            recargos: recargosDelVehiculo > 0 ? recargosDelVehiculo : [], // Puedes asignar recargos si están en el stateLiquidacion
          };
      
          return detalles;
        })
      );

      const selectedVehiculos = vehiculosOptions.filter((option) =>
        stateLiquidacion.vehiculos.some((vehiculo) => vehiculo.id === option.value)
      );
    
     setVehiculosSelected(selectedVehiculos)

     setDateSelected({
      start: parseDate(stateLiquidacion.periodoStart),
      end: parseDate(stateLiquidacion.periodoEnd),
     })


      // // Actualizar otros campos (por ejemplo: ajuste salarial)
      // setIsCheckedAjuste(stateLiquidacion.ajusteSalarial > 0);
      // setDiasLaborados(stateLiquidacion.diasLaborados);
    }
  }, [stateLiquidacion, conductoresOptions, vehiculosOptions]);

  // Manejador de fechas
  const handleDateChange = (newDate: RangeValue<DateValue> | null) => {
    setDateSelected(newDate);
  }

  // Manejadores de eventos
  const handleVehiculoSelect = useCallback(
    (selected: MultiValue<VehiculoOption>) => {
      // Convierte `MultiValue<VehiculoOption>` a `VehiculoOption[]`
      const selectedVehiculos = selected.map((option) => ({
        value: option.value,
        label: option.label,
      }));

      setVehiculosSelected(selectedVehiculos);

      // Crea un mapa de detallesVehiculos para búsqueda más rápida
      const detallesMap = new Map(
        detallesVehiculos.map((detalle) => [detalle.vehiculo.value, detalle])
      );

      // Actualiza detallesVehiculos basado en la selección
      setDetallesVehiculos(
        selectedVehiculos.map((vehiculo) => {
          const detalleExistente = detallesMap.get(vehiculo.value);
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
    [detallesVehiculos, conductorSelected, vehiculosSelected, setDetallesVehiculos]
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
                  i === index ? { ...pernote, [field]: value, valor: 100906 } : pernote
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
        (c) => c.id === conductorSelected?.value
      );
      return conductor
        ? diasLaborados >= 17
          ? 2101498 - conductor.salarioBase
          : ((2101498 - conductor.salarioBase) / 30) * diasLaborados
        : 0;
    }
    return 0;
  }, [isCheckedAjuste, liquidacion, diasLaborados]);

  const {
    auxilioTransporte,
    salarioBaseConductor,
    sueldoTotal,
    totalPernotes,
    totalBonificaciones,
    totalRecargos,
  } = useMemo(() => {

    console.log('liquida')
    const total = detallesVehiculos.reduce(
      (acc, item) => {
        const bonos = item.bonos.reduce(
          (total, bono) => total + bono.quantity * bono.value,
          0
        );
        const pernotes = item.pernotes.reduce(
          (total, pernote) => total + pernote.cantidad * 100906, // Puedes ajustar el valor de pernote si es una constante
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

    // Obtén el salario base del conductor seleccionado
    const salarioBaseConductor =
      conductores.find(
        (conductorState) => conductorState.id === conductorSelected?.value
      )?.salarioBase || 0;

    const auxilioTransporte = 162000; // Asigna el auxilio de transporte

    return {
      auxilioTransporte,
      salarioBaseConductor,
      totalBonificaciones: total.totalBonos,
      totalPernotes: total.totalPernotes,
      totalRecargos: total.totalRecargos,
      sueldoTotal:
        total.totalSubtotales +
        bonificacionVillanueva + // Incluye la bonificación si aplica
        salarioBaseConductor +
        auxilioTransporte,
    };
  }, [
    detallesVehiculos,
    bonificacionVillanueva,
    dateSelected,
    conductorSelected,
    vehiculosSelected,
    conductores,
  ]);

  // Actualización de la liquidación en el useEffect
  // Actualización de la liquidación en el useEffect
  useEffect(() => {
    // Verificar que `conductorSelected` y `vehiculosSelected` sean válidos
    if (!conductorSelected || detallesVehiculos.length === 0 || vehiculosSelected.length === 0) return;
  
    console.log(detallesVehiculos);
  
    // Crea el objeto `Liquidacion` compatible con el tipo que definiste
    const nuevaLiquidacion: LiquidacionInput = {
      periodoStart: dateSelected?.start || null,
      periodoEnd: dateSelected?.end || null,
      bonificaciones: detallesVehiculos.flatMap((detalle) => 
        detalle.bonos.map((bono) => ({
          ...bono,
          vehiculoId: detalle.vehiculo.value, // Agrega el vehiculoId a cada bono
        }))
      ),
      pernotes: detallesVehiculos.flatMap((detalle) => 
        detalle.pernotes.map((pernote) => ({
          ...pernote,
          vehiculoId: detalle.vehiculo.value, // Agrega el vehiculoId a cada pernote
        }))
      ),
      recargos: detallesVehiculos.flatMap((detalle) => 
        detalle.recargos.map((recargo) => ({
          ...recargo,
          vehiculoId: detalle.vehiculo.value, // Agrega el vehiculoId a cada recargo
        }))
      ),
      conductorId:
        conductores.find(
          (conductor) => conductor.id === conductorSelected?.value
        )?.id || null, // Busca el conductor completo basado en la selección
      auxilioTransporte,
      sueldoTotal,
      totalPernotes,
      totalBonificaciones,
      totalRecargos,
      diasLaborados,
      ajusteSalarial: bonificacionVillanueva,
      vehiculos: detallesVehiculos.map((detalle) => detalle.vehiculo.value),
    };
  
    setLiquidacion(nuevaLiquidacion);
  }, [
    auxilioTransporte,
    sueldoTotal,
    totalPernotes,
    totalBonificaciones,
    dateSelected,
    vehiculosSelected, // Ahora también dependemos de cambios en `vehiculosSelected`
    totalRecargos,
    conductorSelected, // Dependemos de cambios en `conductorSelected`
    detallesVehiculos,
    conductores,
  ]);
  

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

  // Función para agregar la liquidación
  const addLiquidacion = () => {
    // Verifica que liquidacion no sea null antes de registrarla
    if (liquidacion) {
      try {
        agregarLiquidacion(liquidacion);

        console.log(liquidacion);

        // Reiniciar liquidacion a null
        setLiquidacion(null);
        setConductorSelected(null);
        setVehiculosSelected([]);
        setDetallesVehiculos([]);
        setDateSelected(null);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.error("Liquidación no válida.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-10">
      <form className="w-full flex flex-col space-y-8">
        {/* Conductor y Placa */}
        <div className="space-y-4 flex flex-col">
          <h2 className="font-bold text-2xl text-green-700">Formulario</h2>
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
            onChange={handleDateChange}
            label="Periodo a liquidar"
            value={dateSelected}
          />

          {conductorSelected && vehiculosSelected &&
            dateSelected &&
            detallesVehiculos?.map((detalleVehiculo, index) => (
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
                  {detalleVehiculo.pernotes?.map((pernote, pernoteIndex) => (
                    <div
                      key={pernoteIndex}
                      className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center"
                    >
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
                            selectedOption?.value || "",
                          )
                        }
                        placeholder="Selecciona una empresa"
                        isSearchable
                        styles={customStyles}
                        className="lg:col-span-3"
                      />
                      <Input
                        type="number"
                        label="Cantidad"
                        placeholder="0"
                        className="lg:col-span-1"
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
                        className="m-auto bg-red-300 text-white w-full lg:col-span-1 lg:w-auto"
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      handleAddPernote(detalleVehiculo.vehiculo.value)
                    }
                    className="bg-green-300"
                  >
                    Añadir pernote
                  </Button>
                  <h3 className="font-semibold mb-2">Recargos</h3>
                  {detalleVehiculo.recargos?.map((recargo, recargoIndex) => (
                    <div
                      key={recargoIndex}
                      className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-center"
                    >
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
                        className="lg:col-span-3"
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
                        className="m-auto bg-red-300 text-white w-full lg:col-span-1 lg:w-auto"
                      >
                        X
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() =>
                      handleAddRecargo(detalleVehiculo.vehiculo.value)
                    }
                    className="bg-green-300"
                  >
                    Añadir recargo
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </form>
      <div className="w-full">
        {detallesVehiculos && dateSelected && vehiculos && (
          <>
            <ConductorInfo
              conductor={
                conductores.find((c) => c.id === conductorSelected?.value) ||
                null
              }
              dateSelected={dateSelected}
            />
            {detallesVehiculos.map((detalle, index) => (
              <CardLiquidacion key={index} detalleVehiculo={detalle} />
            ))}
          </>
        )}
        {detallesVehiculos.length > 0 && dateSelected && vehiculos && (
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
                <p>{formatToCOP(salarioBaseConductor)}</p>
              </div>
              <div>
                <p>Auxilio transporte:</p>
                <p>{formatToCOP(auxilioTransporte)}</p>
              </div>
              <div>
                <p>Total bonificacaciones:</p>
                <p>
                  {formatToCOP(
                    totalBonificaciones + totalPernotes + totalRecargos
                  )}
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

interface ConductorInfoProps {
  conductor: Conductor | null;
  dateSelected: RangeValue<DateValue> | null;
}

const ConductorInfo = ({ conductor, dateSelected }: ConductorInfoProps) => {
  if (!conductor) return null;
  return (
    <div className="mb-5">
      <h1 className="text-center text-2xl font-bold">{`${conductor.nombre} ${conductor.apellido}`}</h1>
      <p className="text-center">C.C. {conductor.cc}</p>
      <h2 className="text-center">
        {formatDate(dateSelected?.start)} -{" "}
        {formatDate(dateSelected?.end)}
      </h2>
    </div>
  );
};

interface ListSectionProps<T> {
  title: string;
  items: T[];
  formatFn: (item: T, index: number) => React.ReactNode;
}

const ListSection = <T,>({ title, items, formatFn }: ListSectionProps<T>) => (
  <div className="space-y-2">
    <h3 className="text-xl font-semibold">{title}</h3>
    <div>
      {items.map((item, index) => (
        <div key={index} className="md:grid md:grid-cols-5">
          {formatFn(item, index)}
        </div>
      ))}
    </div>
  </div>
);

interface CardLiquidacionProps {
  detalleVehiculo: DetalleVehiculo;
}

const CardLiquidacion = ({ detalleVehiculo }: CardLiquidacionProps) => {
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
      <CardBody className="gap-5 text-sm">
        <ListSection
          title="Bonificaciones"
          items={detalleVehiculo.bonos}
          formatFn={(bono) => (
            <>
              <p className="col-span-3">
                {bono.name} ({formatToCOP(bono.value)}) :
              </p>
              <p className="md:text-right text-primary-500">{bono.quantity}</p>
              <p className="md:text-right text-green-500 mb-5 md:mb-0">
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
                <p className="md:text-right text-primary-500">
                  {pernote.cantidad}
                </p>
                <p className="md:text-right text-green-500">
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
              <div className="mb-2">
                <p className="col-span-4 text-md">{empresa?.Nombre}</p>
                <p className="md:text-right text-green-500">
                  {formatToCOP(recargo.valor)}
                </p>
              </div>
            );
          }}
        />
      </CardBody>
      <Divider />
      <CardFooter className="w-full space-y-2 flex flex-col">
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

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow = ({ label, value }: SummaryRowProps) => (
  <div className="w-full flex justify-between">
    <p className="font-semibold">{label}: </p>
    <p className="text-yellow-500">{value}</p>
  </div>
);
