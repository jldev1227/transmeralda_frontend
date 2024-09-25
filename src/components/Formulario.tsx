import { Input } from "@nextui-org/input";
import {
  DatePicker,
  DateRangePicker,
  DateValue,
  RangeValue,
} from "@nextui-org/react";
import SelectReact, { MultiValue, SingleValue } from "react-select";
import { Select, SelectItem } from "@nextui-org/select";
import { Divider } from "@nextui-org/divider";
import { Checkbox } from "@nextui-org/checkbox";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { empresas } from "@/data/index";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  formatToCOP,
  formatDate,
  obtenerMesesEntreFechas,
  dateToDateValue,
  formatCurrency,
} from "@/helpers";
import {
  Pernote,
  Recargo,
  DetalleVehiculo,
  LiquidacionInput,
  ConductorOption,
  VehiculoOption,
  Conductor,
  Vehiculo,
} from "@/types/index";
import useLiquidacion from "@/hooks/useLiquidacion";
import { parseDate } from "@internationalized/date";
import PdfMaker from "./pdfMaker";

// Componente Formulario
export default function Formulario() {
  const { state, dispatch, submitLiquidacion } = useLiquidacion();
  const { liquidacion: stateLiquidacion } = state; // Obtenemos la liquidación del estado global

  const [conductorSelected, setConductorSelected] =
    useState<SingleValue<ConductorOption>>(null);
  const [vehiculosSelected, setVehiculosSelected] = useState<
    MultiValue<VehiculoOption>
  >([]);
  const [dateSelected, setDateSelected] =
    useState<RangeValue<DateValue> | null>(null);
  const [detallesVehiculos, setDetallesVehiculos] = useState<DetalleVehiculo[]>(
    []
  );
  const [mesesRange, setMesesRange] = useState<string[]>([]);
  const [liquidacion, setLiquidacion] = useState<LiquidacionInput | null>(null);
  const [isCheckedAjuste, setIsCheckedAjuste] = useState(false);
  const [diasLaborados, setDiasLaborados] = useState(0);

  // Opciones para selectores
  const conductoresOptions = useMemo(
    () =>
      state.conductores.map((conductor) => ({
        value: conductor.id,
        label: `${conductor.nombre} ${conductor.apellido}`,
      })),
    [state.conductores]
  );

  const vehiculosOptions = useMemo(
    () =>
      state.vehiculos.map((vehiculo) => ({
        value: vehiculo.id,
        label: vehiculo.placa,
      })),
    [state.vehiculos]
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

      // Mapear vehículos y asignar bonos, pernotes y recargos
      setDetallesVehiculos(
        stateLiquidacion?.vehiculos?.map((vehiculo: Vehiculo) => {
          // Filtrar los bonos, pernotes y recargos correspondientes al vehículo
          const bonosDelVehiculo =
            stateLiquidacion.bonificaciones?.filter(
              (bono) => bono.vehiculoId === vehiculo.id
            ) || [];

          const pernotesDelVehiculo =
            stateLiquidacion.pernotes?.filter(
              (pernote) => pernote.vehiculoId === vehiculo.id
            ) || [];

          const recargosDelVehiculo =
            stateLiquidacion.recargos?.filter(
              (recargo) => recargo.vehiculoId === vehiculo.id
            ) || [];

          // Definir la estructura de los detalles del vehículo
          const detalles: DetalleVehiculo = {
            vehiculo: {
              value: vehiculo.id,
              label: vehiculo.placa,
            },
            bonos:
              bonosDelVehiculo.length > 0
                ? bonosDelVehiculo.map((bono) => ({
                    name: bono.name,
                    values: bono.values?.map((val) => ({
                      mes: val.mes,
                      quantity: val.quantity,
                    })) || [{ mes: "Mes no definido", quantity: 0 }],
                    value: bono.value,
                  }))
                : [
                    {
                      name: "Bono de alimentación",
                      values: mesesRange.map((mes) => ({
                        mes,
                        quantity: 0,
                      })),
                      value: 22960,
                    },
                    {
                      name: "Bono día trabajado",
                      values: mesesRange.map((mes) => ({
                        mes,
                        quantity: 0,
                      })),
                      value: 13000,
                    },
                    {
                      name: "Bono día trabajado doble",
                      values: mesesRange.map((mes) => ({
                        mes,
                        quantity: 0,
                      })),
                      value: 25000,
                    },
                  ],
            pernotes: pernotesDelVehiculo.map((pernote) => ({
              ...pernote,
              fechas: pernote.fechas || [],
            })),
            recargos: recargosDelVehiculo.map((recargo) => ({
              ...recargo,
              pagCliente: recargo.pagCliente || false,
              mes: recargo.mes,
            })),
          };

          return detalles;
        }) || []
      );

      // Actualizar vehículos seleccionados
      const selectedVehiculos = vehiculosOptions.filter((option) =>
        stateLiquidacion.vehiculos.some(
          (vehiculo) => vehiculo.id === option.value
        )
      );
      setVehiculosSelected(selectedVehiculos);

      // Actualizar las fechas seleccionadas
      setDateSelected({
        start: parseDate(stateLiquidacion.periodoStart),
        end: parseDate(stateLiquidacion.periodoEnd),
      });

      // Actualizar otros campos (ajuste salarial, días laborados)
      setIsCheckedAjuste(stateLiquidacion.ajusteSalarial > 0);
      setDiasLaborados(stateLiquidacion.diasLaborados);
    }
  }, [stateLiquidacion, conductoresOptions, vehiculosOptions, mesesRange]);

  // Manejador de fechas
  const handleDateChange = (newDate: RangeValue<DateValue> | null) => {
    setDateSelected(newDate);
  };

  // Efecto para actualizar mesesRange basado en dateSelected
  useEffect(() => {
    if (dateSelected && dateSelected.start && dateSelected.end) {
      const start = dateSelected.start;
      const end = dateSelected.end;

      const nuevosMeses = obtenerMesesEntreFechas(start, end);

      // Solo actualiza mesesRange si es diferente al valor actual
      if (JSON.stringify(nuevosMeses) !== JSON.stringify(mesesRange)) {
        setMesesRange(nuevosMeses);
      }
    }
  }, [dateSelected, mesesRange]);

  useEffect(() => {
    if (vehiculosSelected && mesesRange.length > 0) {
      const detallesMap = new Map(
        detallesVehiculos.map((detalle) => [detalle.vehiculo.value, detalle])
      );

      const nuevosDetalles = vehiculosSelected.map(
        (vehiculo: DetalleVehiculo["vehiculo"]) => {
          const detalleExistente = detallesMap?.get(vehiculo?.value);

          // Si ya existe un detalle, actualizar los bonos con los nuevos mesesRange
          if (detalleExistente) {
            return {
              ...detalleExistente,
              bonos: detalleExistente.bonos.map((bono) => ({
                ...bono,
                values: mesesRange.map((mes) => {
                  const bonoExistente = bono.values.find(
                    (val) => val.mes === mes
                  );
                  return bonoExistente || { mes, quantity: 0 }; // Mantener el quantity si el mes ya existe
                }),
              })),
            };
          }

          // Si no existe, crear los detalles con los mesesRange
          return {
            vehiculo,
            bonos: [
              {
                name: "Bono de alimentación",
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                value: 22960,
                vehiculoId: vehiculo?.value,
              },
              {
                name: "Bono día trabajado",
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                value: 13000,
              },
              {
                name: "Bono día trabajado doble",
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                value: 25000,
              },
            ],
            pernotes: [],
            recargos: [],
          };
        }
      );

      // Solo actualiza detallesVehiculos si ha habido un cambio
      if (
        JSON.stringify(nuevosDetalles) !== JSON.stringify(detallesVehiculos)
      ) {
        setDetallesVehiculos(nuevosDetalles);
      }
    }
  }, [vehiculosSelected, mesesRange, detallesVehiculos, dateSelected]);

  // Manejadores de eventos
  const handleVehiculoSelect = useCallback(
    (selected: MultiValue<VehiculoOption>) => {
      const selectedVehiculos = selected.map((option) => ({
        value: option.value,
        label: option.label,
      }));

      // Solo actualiza si `selectedVehiculos` ha cambiado
      if (
        JSON.stringify(selectedVehiculos) !== JSON.stringify(vehiculosSelected)
      ) {
        setVehiculosSelected(selectedVehiculos);
      }
    },
    [vehiculosSelected]
  );

  const handleBonoChange = useCallback(
    (vehiculoId: string, name: string, mes: string, quantity: number) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                bonos: detalle.bonos.map((bono) =>
                  bono.name === name
                    ? {
                        ...bono,
                        values: bono.values.map((val) =>
                          val.mes === mes ? { ...val, quantity } : val
                        ),
                      }
                    : bono
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
      value: string | number | Date // Permitir que también sea de tipo Date
    ) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                pernotes: detalle.pernotes.map((pernote, i) =>
                  i === index
                    ? { ...pernote, [field]: value, valor: 100906 }
                    : pernote
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
      value: string | number | boolean, // Agregamos `boolean` como posible tipo
      pagCliente?: boolean // Añadimos el parámetro opcional `pagCliente`
    ) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
                ...detalle,
                recargos: detalle.recargos.map((recargo, i) =>
                  i === index
                    ? {
                        ...recargo,
                        [field]: value, // Actualiza el campo especificado
                        ...(pagCliente !== undefined && {
                          pagCliente: pagCliente,
                        }), // Inserta `pagCliente` si se pasó como argumento
                      }
                    : recargo
                ),
              }
            : detalle
        )
      );
    },
    []
  );

  const handleAddPernote = useCallback((vehiculoId: string) => {
    setDetallesVehiculos((prevDetalles: any) =>
      prevDetalles.map((detalle: any) =>
        detalle.vehiculo.value === vehiculoId
          ? {
              ...detalle,
              pernotes: [
                ...detalle.pernotes,
                { empresa: "", cantidad: 0, fechas: [] },
              ],
            }
          : detalle
      )
    );
  }, []);

  const handleAddRecargo = useCallback((vehiculoId: string) => {
    setDetallesVehiculos((prevDetalles: any) =>
      prevDetalles.map((detalle: any) =>
        detalle.vehiculo.value === vehiculoId
          ? {
              ...detalle,
              recargos: [
                ...detalle.recargos,
                { empresa: "", valor: 0, pagCliente: null, mes: "" },
              ],
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

  const limpiarStates = () => {
    setLiquidacion(null);
    setConductorSelected(null);
    setMesesRange([]);
    setVehiculosSelected([]);
    setDetallesVehiculos([]);
    setDateSelected(null);
    setIsCheckedAjuste(false);
    setDiasLaborados(0);
  };

  const bonificacionVillanueva = useMemo(() => {
    if (isCheckedAjuste) {
      const conductor = state.conductores.find(
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
    const total = detallesVehiculos.reduce(
      (acc, item) => {
        const bonos = item.bonos.reduce(
          (total, bono) =>
            total +
            bono.values.reduce(
              (sum, val) => sum + val.quantity * bono.value,
              0
            ),
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
      state.conductores.find(
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
    state.conductores,
  ]);

  // Actualización de la liquidación en el useEffect
  useEffect(() => {
    // Verificar que todos los campos requeridos estén disponibles antes de continuar
    if (
      !conductorSelected ||
      detallesVehiculos.length === 0 ||
      vehiculosSelected.length === 0 ||
      !dateSelected?.start ||
      !dateSelected?.end
    ) {
      return;
    }

    // Crea el objeto `Liquidacion` compatible con el tipo que definiste
    const nuevaLiquidacion: LiquidacionInput = {
      periodoStart: dateSelected.start, // Asegura que no sea null
      periodoEnd: dateSelected.end, // Asegura que no sea null
      bonificaciones: detallesVehiculos.flatMap((detalle) =>
        detalle.bonos.map((bono) => ({
          ...bono,
          vehiculoId: detalle.vehiculo.value, // Agrega el vehiculoId a cada bono
          values: bono.values.map((value) => ({
            ...value,
            quantity: value.quantity || 0, // Asegura que quantity esté presente
          })),
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
        state.conductores.find(
          (conductor) => conductor.id === conductorSelected?.value
        )?.id || null, // Busca el conductor completo basado en la selección
      auxilioTransporte: auxilioTransporte || 0, // Asegura un valor por defecto
      sueldoTotal: sueldoTotal || 0,
      totalPernotes: totalPernotes || 0,
      totalBonificaciones: totalBonificaciones || 0,
      totalRecargos: totalRecargos || 0,
      diasLaborados: diasLaborados || 0,
      ajusteSalarial: bonificacionVillanueva || 0, // Usa bonificacionVillanueva o 0
      vehiculos: detallesVehiculos.map((detalle) => detalle.vehiculo.value),
    };

    // Actualizar el estado de `liquidacion`
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
    state.conductores,
    mesesRange,
    diasLaborados,
    bonificacionVillanueva, // Ajuste salarial
  ]);

  const customStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#f4f4f5",
      border: "none",
      borderRadius: "12px",
      padding: "11px",
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
  const handleSubmit = async () => {
    // Verifica que la liquidación no sea null antes de registrarla
    if (liquidacion) {
      try {
        // Filtra las bonificaciones, pernotes y recargos para remover el campo __typename
        const bonificacionesFiltradas =
          liquidacion?.bonificaciones?.map(({ __typename, ...rest }) => rest) ||
          [];

          console.log(bonificacionesFiltradas)

        const pernotesFiltrados =
          liquidacion?.pernotes?.map(({ __typename, ...rest }) => rest) || [];

        const recargosFiltrados =
          liquidacion?.recargos?.map(({ __typename, ...rest }) => rest) || [];

        // Construye el objeto final de liquidación asegurando que todos los campos requeridos están presentes
        const liquidacionFinal = {
          id: stateLiquidacion?.id || undefined, // Usa el ID de stateLiquidacion si está disponible
          periodoStart: liquidacion.periodoStart,
          periodoEnd: liquidacion.periodoEnd,
          conductorId: liquidacion.conductorId || null, // Asegura que conductorId sea nulo si no está presente
          auxilioTransporte: liquidacion.auxilioTransporte || 0, // Provee un valor por defecto si es necesario
          sueldoTotal: liquidacion.sueldoTotal || 0,
          totalPernotes: liquidacion.totalPernotes || 0,
          totalBonificaciones: liquidacion.totalBonificaciones || 0,
          totalRecargos: liquidacion.totalRecargos || 0,
          diasLaborados: liquidacion.diasLaborados || 0,
          ajusteSalarial: liquidacion.ajusteSalarial || 0,
          vehiculos: liquidacion.vehiculos, // Mapeamos los valores correctos de los vehículos
          bonificaciones: bonificacionesFiltradas, // Enviamos las bonificaciones filtradas
          pernotes: pernotesFiltrados, // Enviamos los pernotes filtrados
          recargos: recargosFiltrados, // Enviamos los recargos filtrados
        };

        // Envía la liquidación para agregar o editar
        await submitLiquidacion(liquidacionFinal);

        // Si todo va bien, limpia los estados
        limpiarStates();
      } catch (error) {
        console.error("Error al registrar la liquidación:", error);
        // No limpiar los estados si hubo un error
      }
    } else {
      console.error("Liquidación no válida.");
    }
  };

  return (
    <>
      <div
        className={`grid ${state.allowEdit || state.allowEdit == null ? "xl:grid-cols-2" : "lg:grid-cols-1"} gap-10`}
      >
        {(stateLiquidacion || stateLiquidacion === null) &&
          (state.allowEdit || state.allowEdit === null) && (
            <form className="w-full flex flex-col">
              <div className={"space-y-6 flex flex-col"}>
                <div className="space-y-4 mb-6">
                  <h2 className="font-bold text-2xl text-green-700">
                    {stateLiquidacion?.id ? "Editando" : "Creando"}
                  </h2>
                  <div className="space-y-3">
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
                      lang="es-ES"
                      value={dateSelected}
                    />
                  </div>
                </div>

                {conductorSelected &&
                  vehiculosSelected &&
                  dateSelected &&
                  detallesVehiculos?.map((detalleVehiculo, index) => (
                    <div key={index}>
                      <Card className="space-y-5 flex flex-col p-6">
                        <h2 className="text-xl font-semibold mb-3">
                          Vehículo: {detalleVehiculo.vehiculo.label}
                        </h2>
                        <h3 className="font-semibold text-xl mb-2">
                          Bonificaciones
                        </h3>
                        {detalleVehiculo.bonos.map((bono, index) => (
                          <div
                            key={index}
                            className="flex flex-col md:flex-row md:justify-between md:items-center gap-5 shadow-md rounded-xl px-5 py-4 md:py-2"
                          >
                            <p className="flex-1 font-semibold">{bono.name}</p>
                            {mesesRange.map((mes) => {
                              // Buscar el valor correspondiente al mes dentro de los valores del bono
                              const bonoMes = bono.values.find(
                                (val) => val.mes === mes
                              );

                              return (
                                <Input
                                  key={mes}
                                  type="number"
                                  label={mes}
                                  className="md:w-24"
                                  placeholder={`Ingresa la cantidad de ${bono.name.toLowerCase()}`}
                                  value={
                                    bonoMes ? bonoMes.quantity.toString() : "0"
                                  }
                                  onChange={(e) =>
                                    handleBonoChange(
                                      detalleVehiculo.vehiculo.value,
                                      bono.name,
                                      mes,
                                      +e.target.value
                                    )
                                  }
                                />
                              );
                            })}
                          </div>
                        ))}
                        <Divider />
                        <h3 className="font-semibold text-xl mb-2">Pernotes</h3>
                        {detalleVehiculo.pernotes?.map(
                          (pernote, pernoteIndex) => (
                            <div
                              key={pernoteIndex}
                              className="grid sm:grid-cols-5 gap-4"
                            >
                              {/* Select para la empresa */}
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

                              {/* Input de cantidad fuera del map de DatePickers */}
                              <Input
                                type="number"
                                label="Cantidad"
                                placeholder="0"
                                className="col-span-2"
                                value={pernote.cantidad.toString()}
                                onChange={(e) => {
                                  const newCantidad = +e.target.value;

                                  // Mantener las fechas existentes
                                  let newFechas = [...pernote.fechas];

                                  if (newCantidad > pernote.fechas.length) {
                                    // Si el nuevo valor de cantidad es mayor, añadir fechas vacías
                                    newFechas = [
                                      ...newFechas,
                                      ...Array(
                                        newCantidad - pernote.fechas.length
                                      ).fill(null),
                                    ];
                                  } else if (
                                    newCantidad < pernote.fechas.length
                                  ) {
                                    // Si el nuevo valor de cantidad es menor, cortar el array de fechas
                                    newFechas = newFechas.slice(0, newCantidad);
                                  }

                                  // Actualizar el array de fechas junto con la cantidad
                                  handlePernoteChange(
                                    detalleVehiculo.vehiculo.value,
                                    pernoteIndex,
                                    "fechas",
                                    newFechas
                                  );

                                  handlePernoteChange(
                                    detalleVehiculo.vehiculo.value,
                                    pernoteIndex,
                                    "cantidad",
                                    newCantidad
                                  );
                                }}
                              />

                              {/* Generar tantos DatePickers como el valor de pernote.cantidad */}
                              {pernote.fechas?.map((fecha, dateIndex) => (
                                <DatePicker
                                  key={dateIndex} // Añadir una key para cada DatePicker
                                  label={`Fecha ${dateIndex + 1}`}
                                  className="col-span-5"
                                  value={fecha ? parseDate(fecha) : null}
                                  onChange={(newDate: DateValue | null) => {
                                    if (newDate) {
                                      const jsDate = new Date(
                                        newDate.year,
                                        newDate.month - 1,
                                        newDate.day
                                      );

                                      const startDate = new Date(
                                        dateSelected.start.year,
                                        dateSelected.start.month - 1,
                                        dateSelected.start.day
                                      );
                                      const endDate = new Date(
                                        dateSelected.end.year,
                                        dateSelected.end.month - 1,
                                        dateSelected.end.day
                                      );

                                      if (
                                        jsDate >= startDate &&
                                        jsDate <= endDate
                                      ) {
                                        const newFecha =
                                          dateToDateValue(jsDate);
                                        const newFechas = [...pernote.fechas];
                                        newFechas[dateIndex] = newFecha;

                                        handlePernoteChange(
                                          detalleVehiculo.vehiculo.value,
                                          pernoteIndex,
                                          "fechas",
                                          newFechas
                                        );
                                      } else {
                                        alert(
                                          "La fecha seleccionada no está dentro del rango permitido"
                                        );
                                        const newFechas = [...pernote.fechas];
                                        newFechas[dateIndex] = null;

                                        handlePernoteChange(
                                          detalleVehiculo.vehiculo.value,
                                          pernoteIndex,
                                          "fechas",
                                          newFechas
                                        );
                                      }
                                    }
                                  }}
                                />
                              ))}

                              {/* Botón para remover el pernote */}
                              <Button
                                onClick={() =>
                                  handleRemovePernote(
                                    detalleVehiculo.vehiculo.value,
                                    pernoteIndex
                                  )
                                }
                                className="w-full col-span-5 bg-red-600 text-white"
                              >
                                X
                              </Button>
                            </div>
                          )
                        )}

                        <Button
                          onClick={() =>
                            handleAddPernote(detalleVehiculo.vehiculo.value)
                          }
                          className="w-full col-span-6 bg-primary-700 text-white"
                        >
                          Añadir pernote
                        </Button>

                        <Divider />

                        <h3 className="font-semibold text-xl">Recargos</h3>
                        {detalleVehiculo.recargos?.map(
                          (recargo, recargoIndex) => (
                            <>
                              <div
                                key={recargoIndex}
                                className="grid grid-cols-4 gap-4 items-center"
                              >
                                <Select
                                  label="Mes"
                                  className="col-span-4 sm:col-span-1"
                                  defaultSelectedKeys={recargo.mes ? [recargo.mes] : ''} // Usamos el mes directamente como clave
                                  onSelectionChange={(selected) => {
                                    const mes = Array.from(selected)[0]; // `selected` es un Set, lo convertimos en array para obtener el valor
                                    handleRecargoChange(
                                      detalleVehiculo.vehiculo.value,
                                      recargoIndex,
                                      "mes",
                                      mes // Aquí seleccionamos el mes directamente
                                    );
                                  }}
                                >
                                  {mesesRange?.map((mes) => (
                                    <SelectItem key={mes} value={mes}>
                                      {mes}
                                    </SelectItem>
                                  ))}
                                </Select>

                                <SelectReact
                                  options={empresasOptions}
                                  value={
                                    empresasOptions.find(
                                      (option) =>
                                        option.value === recargo.empresa
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
                                  className="col-span-4 sm:col-span-3"
                                />
                                <Input
                                  type="text" // Mantiene el tipo de 'text' para mostrar el formato con símbolos de moneda
                                  label="Paga propietario"
                                  placeholder="$0"
                                  className="col-span-2"
                                  value={
                                    !recargo.pagCliente && recargo.valor !== 0
                                      ? formatCurrency(recargo.valor)
                                      : ""
                                  } // Muestra el valor solo cuando pagCliente es false
                                  onChange={(e) => {
                                    const inputVal = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    ); // Quitamos caracteres no numéricos
                                    const numericValue = +inputVal; // Convertimos el string limpio a número

                                    // Llamamos a handleRecargoChange con pagaCliente como false
                                    handleRecargoChange(
                                      detalleVehiculo.vehiculo.value,
                                      recargoIndex,
                                      "valor",
                                      numericValue,
                                      false // Aquí especificamos que pagaCliente es false
                                    );
                                  }}
                                />

                                <Input
                                  type="text" // Mantiene el tipo de 'text' para mostrar el formato con símbolos de moneda
                                  label="Paga cliente"
                                  placeholder="$0"
                                  className="col-span-2"
                                  value={
                                    recargo.pagCliente && recargo.valor !== 0
                                      ? formatCurrency(recargo.valor)
                                      : ""
                                  } // Muestra el valor solo cuando pagCliente es true
                                  onChange={(e) => {
                                    const inputVal = e.target.value.replace(
                                      /[^\d]/g,
                                      ""
                                    ); // Quitamos caracteres no numéricos
                                    const numericValue = +inputVal; // Convertimos el string limpio a número

                                    // Llamamos a handleRecargoChange con pagaCliente como true
                                    handleRecargoChange(
                                      detalleVehiculo.vehiculo.value,
                                      recargoIndex,
                                      "valor",
                                      numericValue,
                                      true // Aquí especificamos que pagaCliente es true
                                    );
                                  }}
                                />

                                <Button
                                  onClick={() =>
                                    handleRemoveRecargo(
                                      detalleVehiculo.vehiculo.value,
                                      recargoIndex
                                    )
                                  }
                                  className="col-span-4 bg-red-600 text-white"
                                >
                                  X
                                </Button>
                              </div>
                              <Divider />
                            </>
                          )
                        )}
                        <Button
                          onClick={() =>
                            handleAddRecargo(detalleVehiculo.vehiculo.value)
                          }
                          className="bg-primary-700 text-white"
                        >
                          Añadir recargo
                        </Button>
                      </Card>
                    </div>
                  ))}
              </div>
            </form>
          )}
        <div
          className={`${state.allowEdit || state.allowEdit == null ? "w-full" : "lg:w-1/2 lg:mx-auto"}`}
        >
          {conductorSelected &&
            vehiculosSelected.length > 0 &&
            dateSelected && (
              <>
                <ConductorInfo
                  conductor={
                    state.conductores.find(
                      (c) => c.id === conductorSelected?.value
                    ) || null
                  }
                  dateSelected={dateSelected}
                />
                {detallesVehiculos?.map((detalle, index) => (
                  <CardLiquidacion key={index} detalleVehiculo={detalle} />
                ))}
              </>
            )}
          {detallesVehiculos.length > 0 && dateSelected && state.vehiculos && (
            <Card className="max-h-full">
              <CardHeader>
                <p className="text-xl font-semibold">Resumen</p>
              </CardHeader>
              <Divider />
              <CardBody className="space-y-4">
                <Checkbox
                  isDisabled={
                    state.allowEdit || state.allowEdit == null ? false : true
                  }
                  isSelected={isCheckedAjuste}
                  onChange={(e) => setIsCheckedAjuste(e.target.checked)}
                >
                  Bonificación Villanueva
                </Checkbox>
                {isCheckedAjuste && (
                  <>
                    <Input
                      isDisabled={
                        state.allowEdit || state.allowEdit == null
                          ? false
                          : true
                      }
                      value={diasLaborados.toString()}
                      onChange={(e) => setDiasLaborados(+e.target.value)}
                      type="number"
                      label="Cantidad días laborados"
                      placeholder="Ingresa la cantidad de días laborados"
                      className="max-w-xs"
                    />
                    <div>
                      <p>Bonificación villanueva</p>
                      <p className="text-xl text-orange-400">
                        {formatToCOP(bonificacionVillanueva)}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <p>Salario base:</p>
                  <p className="text-xl text-primary-400">
                    {formatToCOP(salarioBaseConductor)}
                  </p>
                </div>
                <div>
                  <p>Auxilio transporte:</p>
                  <p className="text-xl text-yellow-500">
                    {formatToCOP(auxilioTransporte)}
                  </p>
                </div>
                <div>
                  <p>Total bonificacaciones:</p>
                  <p className="text-xl text-secondary-500">
                    {formatToCOP(
                      totalBonificaciones + totalPernotes + totalRecargos
                    )}
                  </p>
                </div>
                <div>
                  <p>Salario total:</p>
                  <p className="text-2xl text-green-500">
                    {formatToCOP(sueldoTotal)}
                  </p>
                </div>
                {!state.allowEdit && state?.liquidacion?.id && (
                  <div className="grid md:grid-cols-3 gap-5">
                    <div className="col-span-2">
                      <PdfMaker item={state.liquidacion}>
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
                            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                          />
                        </svg>
                        <p className="ml-2">Desprendible de nomina</p>
                      </PdfMaker>
                    </div>
                    <Button
                      className="col-span-2 md:col-span-1 bg-red-600 text-white"
                      onPress={() => {
                        // Cancelar y limpiar los estados
                        dispatch({
                          type: "SET_LIQUIDACION",
                          payload: {
                            allowEdit: null,
                            liquidacion: null,
                          },
                        });

                        limpiarStates();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                      <p>
                        {" "}
                        Cancelar{" "}
                        {stateLiquidacion?.id && state.allowEdit
                          ? "edición"
                          : stateLiquidacion?.id && !state.allowEdit
                            ? "consulta"
                            : "creación"}
                      </p>
                    </Button>
                  </div>
                )}
              </CardBody>
              {(state.allowEdit || state.allowEdit === null) && (
                <>
                  <Divider />
                  <CardFooter className="grid grid-cols-1 md:grid-cols-5 gap-5">
                    <Button
                      onPress={handleSubmit}
                      className="col-span-1 md:col-span-3 bg-green-700 text-white"
                    >
                      {stateLiquidacion?.id
                        ? "Editar liquidación"
                        : "Agregar liquidación"}
                    </Button>
                    <Button
                      className="md:col-span-2 bg-red-600 text-white"
                      onPress={() => {
                        // Cancelar y limpiar los estados
                        dispatch({
                          type: "SET_LIQUIDACION",
                          payload: {
                            allowEdit: null,
                            liquidacion: null,
                          },
                        });

                        limpiarStates();
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5 text-white"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                      Cancelar{" "}
                      {stateLiquidacion?.id && state.allowEdit
                        ? "edición"
                        : stateLiquidacion?.id && !state.allowEdit
                          ? "consulta"
                          : "creación"}
                    </Button>
                  </CardFooter>
                </>
              )}
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

interface ConductorInfoProps {
  conductor: Conductor | null;
  dateSelected: any | null;
}

const ConductorInfo = ({ conductor, dateSelected }: ConductorInfoProps) => {
  if (!conductor) return null;
  return (
    <div className="mb-5">
      <h1 className="text-center text-2xl font-bold">{`${conductor.nombre} ${conductor.apellido}`}</h1>
      <p className="text-center">C.C. {conductor.cc}</p>
      <h2 className="text-center">
        {formatDate(dateSelected?.start)} - {formatDate(dateSelected?.end)}
      </h2>
    </div>
  );
};

interface ListSectionProps<T> {
  title: string;
  items: T[];
  formatFn: (item: Array<T>) => React.ReactNode;
}

const ListSection = <T,>({ title, items, formatFn }: ListSectionProps<T>) => (
  <div className="space-y-2">
    <h3 className="text-xl font-semibold">{title}</h3>
    <div>{formatFn(items)}</div>
  </div>
);

interface CardLiquidacionProps {
  detalleVehiculo: DetalleVehiculo;
}

const CardLiquidacion = ({ detalleVehiculo }: CardLiquidacionProps) => {
  const totalBonos = useMemo(
    () =>
      detalleVehiculo.bonos.reduce(
        (total, bono) =>
          total +
          bono.values.reduce((sum, val) => sum + val.quantity * bono.value, 0),
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
          items={detalleVehiculo?.bonos}
          formatFn={() => {
            return (
              <table className="table-auto w-full text-sm mb-5">
                <thead className="bg-yellow-500 text-white">
                  <tr>
                    <th className="px-4 py-2 text-left">Nombre del bono</th>
                    {detalleVehiculo.bonos[0]?.values.map((val, index) => (
                      <th key={index} className="px-4 py-2 text-center">
                        {val.mes}
                      </th>
                    ))}
                    <th className="px-4 py-2 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {detalleVehiculo.bonos.map((bono, index) => {
                    const total = bono.values.reduce(
                      (sum, val) => sum + val.quantity * bono.value,
                      0
                    );
                    return (
                      <tr key={index}>
                        <td className="border px-4 py-2">{bono.name}</td>
                        {bono.values.map((val, index) => (
                          <td
                            key={index}
                            className="border px-4 py-2 text-center"
                          >
                            {val.quantity}
                          </td>
                        ))}
                        <td className="border px-4 py-2 text-center text-green-500">
                          {formatToCOP(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            );
          }}
        />

        <ListSection
          title="Pernotes"
          items={detalleVehiculo.pernotes}
          formatFn={(pernotes) => {
            if (Array.isArray(pernotes)) {
              // Generar una tabla general con los rows por cada pernote
              return (
                <table className="table-auto w-full text-sm mb-5">
                  <thead className="bg-blue-500 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left">Empresa</th>
                      <th className="px-4 py-2 text-center">Fechas</th>
                      <th className="px-4 py-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pernotes.map((pernote, index) => {
                      const empresa = empresas.find(
                        (empresa) => empresa.NIT === pernote.empresa
                      );

                      return (
                        <tr key={index}>
                          <td className="border px-4 py-2">
                            {empresa ? empresa.Nombre : "Empresa no encontrada"}
                          </td>
                          <td className="border text-center text-primary-500">
                            {pernote?.fechas
                              ?.sort(
                                (a: string, b: string) =>
                                  new Date(a).getTime() - new Date(b).getTime()
                              ) // Ordenar las fechas
                              .map((fecha: any, index) => (
                                <p key={index}>{fecha}</p>
                              ))}
                          </td>
                          <td className="border px-4 py-2 text-center text-green-500">
                            {formatToCOP(pernote.cantidad * pernote.valor || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            }

            // Si no es un array, regresamos null o algún valor por defecto
            return null;
          }}
        />

        <ListSection
          title="Recargos"
          items={detalleVehiculo.recargos}
          formatFn={(recargos) => {
            // Si es un array, lo recorremos
            if (Array.isArray(recargos)) {
              return (
                <table className="table-auto w-full text-sm mb-5">
                  <thead className="bg-green-500 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left">Empresa</th>
                      <th className="px-4 py-2 text-left">Mes</th>
                      <th className="px-4 py-2 text-center">Paga cliente</th>
                      <th className="px-4 py-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recargos.map((recargo, index) => {
                      const empresa = empresas.find(
                        (empresa) => empresa.NIT === recargo.empresa
                      );

                      return (
                        <tr key={index}>
                          <td className="border px-4 py-2">
                            {empresa ? empresa.Nombre : "Empresa no encontrada"}
                          </td>
                          <td className="border px-4 py-2">{recargo.mes}</td>
                          <td className="border px-4 py-2 text-center">
                            {recargo.pagCliente ? "SI" : "NO"}
                          </td>
                          <td className="border px-4 py-2 text-center text-green-500">
                            {formatToCOP(recargo.valor || 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            }

            // Si no es un array, regresamos null o algún valor por defecto
            return null;
          }}
        />
      </CardBody>
      <Divider />
      <CardFooter className="w-full space-y-1 flex flex-col">
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
