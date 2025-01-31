import { Input } from "@nextui-org/input";
import {
  DatePicker,
  DateRangePicker,
  DateValue,
  RangeValue,
} from "@nextui-org/react";
import { Tabs, Tab } from "@nextui-org/tabs";
import SelectReact, { MultiValue, SingleValue } from "react-select";
import { Select, SelectItem } from "@nextui-org/select";
import { Tooltip } from "@nextui-org/tooltip";
import { Divider } from "@nextui-org/divider";
import { Checkbox } from "@nextui-org/checkbox";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { useMemo, useState, useCallback, useEffect } from "react";
import {
  formatToCOP,
  formatDate,
  obtenerMesesEntreFechas,
  dateToDateValue,
  formatCurrency,
  formatDateValue,
  obtenerDiferenciaDias,
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
  Empresa,
  Mantenimiento,
} from "@/types/index";
import useLiquidacion from "@/hooks/useLiquidacion";
import { parseDate } from "@internationalized/date";
import { selectStyles } from "@/styles/selectStyles";
import Anticipos from "@/components/Anticipos";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/table";

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
  const [periodoVacaciones, setPeriodoVacaciones] =
    useState<RangeValue<DateValue> | null>(null);
  const [detallesVehiculos, setDetallesVehiculos] = useState<DetalleVehiculo[]>(
    []
  );
  const [mesesRange, setMesesRange] = useState<string[]>([]);
  const [liquidacion, setLiquidacion] = useState<LiquidacionInput | null>(null);
  const [isCheckedAjuste, setIsCheckedAjuste] = useState(false);
  const [isVacaciones, setIsVacaciones] = useState(false);
  const [isCesantias, setIsCesantias] = useState(false);
  const [diasLaborados, setDiasLaborados] = useState(0);
  const [diasLaboradosVillanueva, setDiasLaboradosVillanueva] = useState(0);
  const [diasLaboradosAnual, setDiasLaboradosAnuales] = useState(0);
  const [cesantias, setCesantias] = useState(0);
  const [interesCesantias, setInteresCesantias] = useState(0);
  const [ajustePorDia, setAjustePorDia] = useState(0);

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
      state.vehiculos.sort((a, b) => a.placa.localeCompare(b.placa)).map((vehiculo) => ({
        value: vehiculo.id,
        label: vehiculo.placa,
      })),
    [state.vehiculos]
  );

  const empresasOptions = useMemo(
    () =>
      state.empresas.map((empresa) => ({
        value: empresa.NIT,
        label: empresa.Nombre,
      })),
    [state.empresas]
  );

  useEffect(() => {
    if (stateLiquidacion) {
      // Actualizar conductor seleccionado
      const selectedConductor = conductoresOptions.find(
        (option) => option.value === stateLiquidacion.conductor.id
      );
      setConductorSelected(selectedConductor || null);

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

      setPeriodoVacaciones(
        stateLiquidacion.periodoStartVacaciones &&
          stateLiquidacion.periodoEndVacaciones
          ? {
            start: parseDate(stateLiquidacion.periodoStartVacaciones),
            end: parseDate(stateLiquidacion.periodoEndVacaciones),
          }
          : null
      );

      const start = stateLiquidacion.periodoStart;
      const end = stateLiquidacion.periodoEnd;

      const nuevosMeses = obtenerMesesEntreFechas(start, end);

      // Solo actualiza mesesRange si es diferente al valor actual
      if (JSON.stringify(nuevosMeses) !== JSON.stringify(mesesRange)) {
        setMesesRange(nuevosMeses);
      }
      // Mapear vehículos y asignar bonos, pernotes y recargos

      // Mapear vehículos y asignar bonos, pernotes y recargos
      const detallesVehiculos =
        stateLiquidacion?.vehiculos?.map((vehiculo: Vehiculo) => {
          // Filtrar los bonos, pernotes y recargos correspondientes al vehículo
          const bonosDelVehiculo =
            stateLiquidacion.bonificaciones?.filter(
              (bono) => bono.vehiculoId === vehiculo.id
            ) || [];

          const mantenimientosDelVehiculo =
            stateLiquidacion.mantenimientos?.filter(
              (mantenimiento: Mantenimiento) => mantenimiento.vehiculoId === vehiculo.id
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
            bonos: [
              ...bonosDelVehiculo.map((bono) => ({
                name: bono.name,
                values: bono.values?.map((val) => ({
                  mes: val.mes,
                  quantity: val.quantity,
                })) || [{ mes: "Mes no definido", quantity: 0 }],
                value: bono.value,
              })),
              ...[
                "Bono de alimentación",
                "Bono día trabajado",
                "Bono día trabajado doble",
                "Bono festividades",
              ]
                .filter(
                  (nombreBono) =>
                    !bonosDelVehiculo.some((bono) => bono.name === nombreBono)
                )
                .map((nombreBono) => ({
                  name: nombreBono,
                  values: mesesRange.map((mes) => ({
                    mes,
                    quantity: 0,
                  })),
                  value:
                    state?.configuracion?.find((config) => config.nombre === nombreBono)
                      ?.valor || 0,
                })),
            ],            
            mantenimientos: mantenimientosDelVehiculo.length > 0
              ? mantenimientosDelVehiculo.map((mantenimiento: Mantenimiento) => ({
                value: state?.configuracion?.find(
                  (config) =>
                    config.nombre === "Mantenimiento"
                )?.valor || 0,
                values: mantenimiento.values?.map((val) => ({
                  mes: val.mes,
                  quantity: val.quantity,
                })) || [{ mes: "Mes no definido", quantity: 0 }],
              })) : [
                {
                  values: mesesRange.map((mes) => ({
                    mes,
                    quantity: 0, // Valores predeterminados si no hay values
                  })),
                  value: state?.configuracion?.find(
                    (config) => config.nombre === "Mantenimiento"
                  )?.valor || 0
                }
              ],
            pernotes: pernotesDelVehiculo.map((pernote) => ({
              ...pernote,
              fechas: pernote.fechas || [],
              valor:
                state?.configuracion?.find(
                  (config) => config.nombre === "Pernote"
                )?.valor || 0,
            })),
            recargos: recargosDelVehiculo.map((recargo) => ({
              ...recargo,
              pagCliente: recargo.pagCliente || false,
              mes: recargo.mes,
            })),
          };

          return detalles;
        }) || [];

      setDetallesVehiculos(detallesVehiculos);

      // Actualizar otros campos (ajuste salarial, días laborados)
      setIsCheckedAjuste(stateLiquidacion.ajusteSalarial > 0);
      setIsVacaciones(stateLiquidacion.totalVacaciones > 0);
      setIsCesantias(stateLiquidacion.cesantias > 0);
      setDiasLaborados(stateLiquidacion.diasLaborados);
      setDiasLaboradosVillanueva(stateLiquidacion.diasLaboradosVillanueva);
      setDiasLaboradosAnuales(stateLiquidacion.diasLaboradosAnual);
      setCesantias(stateLiquidacion.cesantias);
      setInteresCesantias(stateLiquidacion.interesCesantias);
    }
  }, [stateLiquidacion]);

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [state.liquidacion]);

  // Manejador de fechas
  const handleDateChange = (newDate: RangeValue<DateValue> | null) => {
    setDateSelected(newDate);
  };

  // Manejador de fechas
  const handleDateVacacionesChange = (
    newDate: RangeValue<DateValue> | null
  ) => {
    setPeriodoVacaciones(newDate);
  };

  // Efecto para actualizar mesesRange basado en dateSelected
  useEffect(() => {
    if (dateSelected && dateSelected.start && dateSelected.end) {
      const start = dateSelected.start;
      const end = dateSelected.end;

      const nuevosMeses = obtenerMesesEntreFechas(
        formatDateValue(start),
        formatDateValue(end)
      );

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
                value:
                  state?.configuracion?.find(
                    (config) => config.nombre === bono.name
                  )?.valor || 0,
                values: mesesRange.map((mes) => {
                  const bonoExistente = bono.values.find(
                    (val) => val.mes === mes
                  );
                  return bonoExistente || { mes, quantity: 0 }; // Mantener el quantity si el mes ya existe
                }),
              })),
              mantenimientos: detalleExistente.mantenimientos.map((mantenimiento) => ({
                ...mantenimiento,
                value:
                  state?.configuracion?.find(
                    (config) => config.nombre === "Mantenimiento"
                  )?.valor || 0,
                values: mesesRange.map((mes) => {
                  const mantenimientoExistente = mantenimiento.values.find(
                    (val) => val.mes === mes
                  );
                  return mantenimientoExistente || { mes, quantity: 0 }; // Mantener el quantity si el mes ya existe
                }),
              })),
              pernotes: detalleExistente.pernotes.map((pernote) => ({
                ...pernote,
                valor:
                  state?.configuracion?.find(
                    (config) => config.nombre === "Pernote"
                  )?.valor || 0,
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
                value:
                  state?.configuracion?.find(
                    (config) => config.nombre === "Bono de alimentación"
                  )?.valor || 0,
                vehiculoId: vehiculo?.value,
              },
              {
                name: "Bono día trabajado",
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                value:
                  state?.configuracion?.find(
                    (config) => config.nombre === "Bono día trabajado"
                  )?.valor || 0,
              },
              {
                name: "Bono día trabajado doble",
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                value:
                  state?.configuracion?.find(
                    (config) => config.nombre === "Bono día trabajado doble"
                  )?.valor || 0,
              },
              {
                name: "Bono festividades",
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                value:
                  state?.configuracion?.find(
                    (config) => config.nombre === "Bono festividades"
                  )?.valor || 0,
              },
              
            ],
            mantenimientos: [
              {
                value: state?.configuracion?.find(
                  (config) => config.nombre === "Mantenimiento"
                )?.valor || 0,
                values: mesesRange.map((mes) => ({
                  mes: mes,
                  quantity: 0,
                })),
                vehiculoId: vehiculo.value
              }],
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
  }, [
    vehiculosSelected,
    mesesRange,
    detallesVehiculos,
    dateSelected,
    state?.configuracion,
  ]);

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

  const handleOnchangeVehiculoSelect = useCallback(
    (id: number | string, selected: SingleValue<VehiculoOption>) => {
      if (!selected) return; // Asegurarse de que `selected` tenga un valor válido

      const selectedVehiculo = {
        value: selected.value,
        label: selected.label,
      };

      // Validar si el vehículo ya existe en `vehiculosSelected`
      const vehiculoDuplicado = vehiculosSelected.find(
        (vehiculo) =>
          vehiculo.value === selectedVehiculo.value &&
          vehiculo.label === selectedVehiculo.label
      );

      if (vehiculoDuplicado) {
        alert('El vehículo ya está seleccionado');
        return vehiculoDuplicado;
      }

      // Actualizar el array `vehiculosSelected` si no es un duplicado
      const vehiculosActualizado = vehiculosSelected.map((vehiculo, index) => {
        if (index === id) {
          return selectedVehiculo;
        }
        return vehiculo;
      });

      setVehiculosSelected(vehiculosActualizado);


      // Actualizar `detallesVehiculos` solo para el vehículo filtrado
      const detallesActualizados = detallesVehiculos.map((detalle, index) => {
        if (index === id) {
          return {
            ...detalle,
            vehiculo: selectedVehiculo, // Mantiene los detalles actuales y actualiza el vehículo
          };
        }
        return detalle; // Mantiene los demás detalles sin cambios
      });

      setDetallesVehiculos(detallesActualizados); // Asume que tienes un setDetallesVehiculos
    },
    [vehiculosSelected, detallesVehiculos, setVehiculosSelected]
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
                    values: bono.values.some((val) => val.mes === mes)
                      ? bono.values.map((val) =>
                        val.mes === mes ? { ...val, quantity } : val
                      )
                      : [...bono.values, { mes, quantity }], // Agregar nuevo mes si no existe
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

  const handleMantenimientoChange = useCallback(
    (vehiculoId: string, mes: string, quantity: number) => {
      setDetallesVehiculos((prevDetalles) =>
        prevDetalles.map((detalle) =>
          detalle.vehiculo.value === vehiculoId
            ? {
              ...detalle,
              mantenimientos: detalle.mantenimientos.map((mantenimiento) => ({
                ...mantenimiento,
                values: mantenimiento.values.some((val) => val.mes === mes)
                  ? mantenimiento.values.map((val) =>
                    val.mes === mes ? { ...val, quantity } : val
                  )
                  : [...mantenimiento.values, { mes, quantity }], // Agregar nuevo mes si no existe
              })),
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
      value: string | number | Date | string[] | null // Permitir que también sea de tipo Date
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

  const handleAddPernote = useCallback(
    (vehiculoId: string) => {
      setDetallesVehiculos((prevDetalles: any) =>
        prevDetalles.map((detalle: any) =>
          detalle.vehiculo.value === vehiculoId
            ? {
              ...detalle,
              pernotes: [
                ...detalle.pernotes,
                {
                  empresa: "",
                  cantidad: 0,
                  fechas: [],
                  valor: state?.configuracion?.find(
                    (config) => config.nombre === "Pernote"
                  )?.valor,
                },
              ],
            }
            : detalle
        )
      );
    },
    [state.configuracion]
  );

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
    setIsVacaciones(false);
    setIsCesantias(false);
    setPeriodoVacaciones(null);
    setDiasLaborados(0);
    setDiasLaboradosVillanueva(0);
  };

  const bonificacionVillanueva: number = useMemo(() => {
    if (isCheckedAjuste) {
      const conductor = state.conductores.find(
        (c) => c.id === conductorSelected?.value
      );

      const ajusteVillanueva =
        state.configuracion?.find(
          (config) => config.nombre === "Salario villanueva"
        )?.valor || 0;

      if (conductor) {
        const ajusteCalculado = (ajusteVillanueva - conductor.salarioBase) / 30;

        // Determinar el ajuste adicional si el valor coincide con 20048 o 26715

        if (diasLaboradosVillanueva >= 17) {
          return ajusteVillanueva - conductor.salarioBase;
        } else {
          const ajustePorDia =
            Number(ajusteCalculado.toFixed()) === 20048
              ? Number(ajusteCalculado.toFixed()) + 2
              : Number(ajusteCalculado.toFixed()) === 26715
                ? Number(ajusteCalculado.toFixed()) + 1
                : ajusteCalculado;

          setAjustePorDia(ajustePorDia);

          // Calcular el total ajustado multiplicado por los días trabajados en Villanueva
          return ajustePorDia * diasLaboradosVillanueva;
        }
      }

      return 0;
    } else {
      setDiasLaboradosVillanueva(0);
    }

    return 0;
  }, [
    isCheckedAjuste,
    diasLaborados,
    diasLaboradosVillanueva,
    conductorSelected,
    state.conductores,
    state.configuracion,
  ]);

  const {
    auxilioTransporte,
    sueldoTotal,
    salarioDevengado,
    salud,
    pension,
    totalPernotes,
    totalBonificaciones,
    totalRecargos,
    totalVacaciones,
    totalAnticipos,
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
          (total, pernote) => {
            const configPernote = state.configuracion?.find(
              (config) => config.nombre == "Pernote"
            );

            return total + (configPernote?.valor || 0) * pernote.cantidad;
          }, // Puedes ajustar el valor de pernote si es una constante
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

    const salarioDevengado = (salarioBaseConductor / 30) * diasLaborados;

    const auxilioTransporte =
      ((state?.configuracion?.find(
        (config) => config.nombre === "Auxilio de transporte"
      )?.valor || 0) /
        30) *
      diasLaborados;

    const saludConfig =
      state.configuracion?.find((config) => config.nombre === "Salud")?.valor ??
      0; // Asumir que cada config tiene una propiedad 'valor'
    const pensionConfig =
      state.configuracion?.find((config) => config.nombre === "Pensión")
        ?.valor ?? 0; // Asumir que cada config tiene una propiedad 'valor'

    let salud = (salarioDevengado * saludConfig) / 100;

    let pension = (salarioDevengado * pensionConfig) / 100;

    const totalAnticipos =
      state.liquidacion?.anticipos?.reduce((total, anticipo) => {
        return total + (anticipo.valor || 0); // Asegúrate de que anticipo.valor no sea undefined
      }, 0) || 0; // Si el resultado es undefined, establece en 0

    let totalVacaciones = 0

    if (isVacaciones) {
      const diasVacaciones = obtenerDiferenciaDias(periodoVacaciones);

      // Asegúrate de convertir diasVacaciones a number
      const diasVacacionesNumerico =
        typeof diasVacaciones === "string"
          ? parseFloat(diasVacaciones)
          : diasVacaciones;

      const pensionVacaciones =
        ((salarioBaseConductor / 30) * diasVacacionesNumerico * pensionConfig) /
        100;
      const saludVacaciones =
        ((salarioBaseConductor / 30) * diasVacacionesNumerico * saludConfig) /
        100;

      totalVacaciones =
        (salarioBaseConductor / 30) * diasVacacionesNumerico;

      if (diasVacacionesNumerico > 0) {
        salud += saludVacaciones;
        pension += pensionVacaciones;
      }
    } else {
      totalVacaciones = 0
      setPeriodoVacaciones(null)
    }

    return {
      auxilioTransporte,
      salud,
      pension,
      salarioBaseConductor,
      totalBonificaciones: total.totalBonos,
      totalPernotes: total.totalPernotes,
      totalRecargos: total.totalRecargos,
      totalAnticipos,
      totalVacaciones,
      salarioDevengado,
      sueldoTotal:
        total.totalSubtotales +
        bonificacionVillanueva +
        salarioDevengado +
        totalVacaciones +
        interesCesantias +
        auxilioTransporte -
        (salud + pension) -
        totalAnticipos,
    };
  }, [
    detallesVehiculos,
    diasLaborados,
    diasLaboradosVillanueva,
    bonificacionVillanueva,
    diasLaboradosAnual,
    dateSelected,
    conductorSelected,
    vehiculosSelected,
    state.conductores,
    state.configuracion,
    periodoVacaciones,
    isVacaciones,
    isCesantias,
    cesantias,
    interesCesantias
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
      periodoStartVacaciones: periodoVacaciones?.start || null, // Asegura que no sea null
      periodoEndVacaciones: periodoVacaciones?.end || null, // Asegura que no sea null
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
      mantenimientos: detallesVehiculos.flatMap((detalle) => {
        if (!detalle.mantenimientos || detalle.mantenimientos.length === 0) {
          // Si no hay mantenimientos, retorna un array con un mantenimiento por defecto
          return [
            {
              vehiculoId: detalle.vehiculo.value,
              values: mesesRange.map((mes) => ({
                mes,
                quantity: 0,
              })),
              value: state?.configuracion?.find(
                (config) => config.nombre === "Mantenimiento"
              )?.valor || 0,
            },
          ];
        }

        // Si hay mantenimientos, procesarlos normalmente
        return detalle.mantenimientos.map((mantenimiento) => ({
          ...mantenimiento,
          vehiculoId: detalle.vehiculo.value,
          values: mantenimiento.values && mantenimiento.values.length > 0
            ? mantenimiento.values.map((value) => ({
              ...value,
              quantity: value.quantity || 0, // Asegura que quantity esté presente
            }))
            : mesesRange.map((mes) => ({
              mes,
              quantity: 0, // Valores predeterminados si no hay values
            })),
          value: state?.configuracion?.find(
            (config) => config.nombre === "Mantenimiento"
          )?.valor || 0,
        }));
      }),
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
      salarioDevengado: salarioDevengado || 0,
      totalPernotes: totalPernotes || 0,
      totalBonificaciones: totalBonificaciones || 0,
      totalRecargos: totalRecargos || 0,
      totalVacaciones: totalVacaciones || 0,
      totalAnticipos: totalAnticipos || 0,
      diasLaborados: diasLaborados || 0,
      diasLaboradosVillanueva: diasLaboradosVillanueva || 0,
      diasLaboradosAnual: diasLaboradosAnual || 0,
      ajusteSalarial: bonificacionVillanueva || 0, // Usa bonificacionVillanueva o 0
      salud: salud || 0, // Usa bonificacionVillanueva o 0
      pension: pension || 0, // Usa bonificacionVillanueva o 0
      cesantias: cesantias || 0, // Usa bonificacionVillanueva o 0
      interesCesantias: interesCesantias || 0, // Usa bonificacionVillanueva o 0
      estado:
        salud > 0 && pension > 0 && totalBonificaciones > 0
          ? "Liquidado"
          : "Pendiente", // Usa bonificacionVillanueva o 0
      vehiculos: detallesVehiculos.map((detalle) => detalle.vehiculo.value),
    };

    // Actualizar el estado de `liquidacion`
    setLiquidacion(nuevaLiquidacion);
  }, [
    auxilioTransporte,
    sueldoTotal,
    salarioDevengado,
    totalPernotes,
    totalBonificaciones,
    dateSelected,
    vehiculosSelected, // Ahora también dependemos de cambios en `vehiculosSelected`
    totalRecargos,
    totalAnticipos,
    totalVacaciones,
    conductorSelected, // Dependemos de cambios en `conductorSelected`
    detallesVehiculos,
    state.conductores,
    mesesRange,
    diasLaborados,
    diasLaboradosVillanueva,
    diasLaboradosAnual,
    periodoVacaciones,
    bonificacionVillanueva, // Ajuste salarial
  ]);

  // Función para agregar la liquidación
  const handleSubmit = async () => {
    // Verifica que la liquidación no sea null antes de registrarla
    if (liquidacion) {
      try {
        // Filtra las bonificaciones, pernotes y recargos para remover el campo __typename
        const bonificacionesFiltradas =
          liquidacion?.bonificaciones?.map(({ __typename, ...rest }) => rest) ||
          [];

        const pernotesFiltrados =
          liquidacion?.pernotes?.map(({ __typename, ...rest }) => rest) || [];

        const recargosFiltrados =
          liquidacion?.recargos?.map(({ __typename, ...rest }) => rest) || [];

        // Construye el objeto final de liquidación asegurando que todos los campos requeridos están presentes
        const liquidacionFinal = {
          id: stateLiquidacion?.id || undefined, // Usa el ID de stateLiquidacion si está disponible
          periodoStart: liquidacion.periodoStart,
          periodoEnd: liquidacion.periodoEnd,
          periodoStartVacaciones: liquidacion.periodoStartVacaciones,
          periodoEndVacaciones: liquidacion.periodoEndVacaciones,
          conductorId: liquidacion.conductorId || null, // Asegura que conductorId sea nulo si no está presente
          auxilioTransporte: liquidacion.auxilioTransporte || 0, // Provee un valor por defecto si es necesario
          sueldoTotal: liquidacion.sueldoTotal || 0,
          salarioDevengado: liquidacion.salarioDevengado || 0,
          totalPernotes: liquidacion.totalPernotes || 0,
          totalBonificaciones: liquidacion.totalBonificaciones || 0,
          totalRecargos: liquidacion.totalRecargos || 0,
          totalVacaciones: liquidacion.totalVacaciones || 0,
          totalAnticipos: liquidacion.totalAnticipos || 0,
          diasLaborados: liquidacion.diasLaborados || 0,
          diasLaboradosVillanueva: liquidacion.diasLaboradosVillanueva || 0,
          diasLaboradosAnual: liquidacion.diasLaboradosAnual || 0,
          ajusteSalarial: liquidacion.ajusteSalarial || 0,
          salud: liquidacion.salud || 0,
          pension: liquidacion.pension || 0,
          cesantias: liquidacion.cesantias || 0,
          interesCesantias: liquidacion.interesCesantias || 0,
          estado: liquidacion.estado,
          vehiculos: liquidacion.vehiculos, // Mapeamos los valores correctos de los vehículos
          bonificaciones: bonificacionesFiltradas, // Enviamos las bonificaciones filtradas
          mantenimientos: liquidacion.mantenimientos,
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
        className={`grid ${state.allowEdit || state.allowEdit == null ? "xl:grid-cols-2" : "lg:grid-cols-1"} gap-10 max-md:px-3`}
      >
        <div className="xl:col-span-2 space-y-3">
          <div className="flex justify-end">
            <Tooltip color="primary" content="Configuración">
              <Button
                onPress={() => {
                  dispatch({
                    type: "SET_MODAL_CONFIGURACION",
                  });
                }}
                color="primary"
                className="right-0"
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
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </Button>
            </Tooltip>
          </div>
          <h1 className="flex-1 text-green-700 font-black text-2xl lg:text-4xl text-center">
            Liquidador de Conductores
          </h1>
        </div>
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
                      styles={selectStyles}
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
                      styles={selectStyles}
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
                    <Card key={detalleVehiculo.vehiculo.value}>
                      <CardHeader className="gap-3">
                        <p className="text-xl font-bold">
                          Vehículo:
                        </p>
                        <SelectReact
                          placeholder="Selecciona una placa"
                          options={vehiculosOptions.filter(vehiculo => vehiculo.value !== detalleVehiculo.vehiculo.value)}
                          value={{
                            value: detalleVehiculo.vehiculo.value,
                            label: detalleVehiculo.vehiculo.label,
                          }}
                          onChange={(selectedOptions) =>
                            handleOnchangeVehiculoSelect(index, selectedOptions)
                          }
                          isSearchable
                          className="col-span-4 sm:col-span-3"
                        />
                      </CardHeader>
                      <Divider />
                      <CardBody className="space-y-5">
                        <h3 className="font-bold text-xl">Bonificaciones</h3>
                        {detalleVehiculo.bonos.map((bono) => (
                          <Card
                            key={bono.name} // Usa 'name' como clave, o cualquier identificador único
                          >
                            <CardBody className="max-md:gap-3 md:flex-row justify-between items-center">
                              <p className="font-semibold">
                                {bono.name}{" "}
                                <span className="text-foreground-400">
                                  (
                                  {formatToCOP(
                                    state.configuracion?.find(
                                      (config) => config.nombre === bono.name
                                    )?.valor || 0
                                  )}
                                  )
                                </span>
                              </p>
                              <div className="flex flex-col md:flex-row gap-5 max-md:w-full">
                                {mesesRange?.map((mes) => {
                                  const bonoMes = bono.values.find(
                                    (val) => val.mes === mes
                                  );

                                  return (
                                    <Input
                                      key={mes} // 'mes' debería ser único aquí
                                      type="number"
                                      label={mes}
                                      className="md:w-24"
                                      placeholder={`Ingresa la cantidad de ${bono.name.toLowerCase()}`}
                                      value={
                                        bonoMes
                                          ? bonoMes.quantity.toString()
                                          : "0"
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
                            </CardBody>
                          </Card>
                        ))}
                        <Divider />
                        <Card>
                          <CardBody className="max-md:gap-3 md:flex-row gap-3 items-center justify-between">
                            <h3 className="font-bold text-xl mb-2">Mantenimientos</h3>
                            <div className="flex gap-5 max-md:w-full">
                              {detalleVehiculo.mantenimientos.map((mantenimiento, indexMantenimiento) => (
                                <div className="flex flex-col md:flex-row gap-5 max-md:w-full" key={indexMantenimiento}>
                                  {mesesRange?.map((mes, indexMes) => {
                                    const mantenimientoMes = mantenimiento.values.find(
                                      (val) => val.mes === mes
                                    );

                                    return (
                                      <Input
                                        key={`${indexMantenimiento}-${indexMes}`} // Generar una clave única combinando índices
                                        type="number"
                                        label={mes}
                                        className="md:w-24"
                                        placeholder={`Ingresa la cantidad de mantenimientos`}
                                        value={
                                          mantenimientoMes
                                            ? mantenimientoMes.quantity.toString()
                                            : "0"
                                        } onChange={(e) => handleMantenimientoChange(
                                          detalleVehiculo.vehiculo.value,
                                          mes,
                                          +e.target.value
                                        )}
                                      />
                                    );
                                  })}
                                </div>
                              ))}

                            </div>
                          </CardBody>
                        </Card>
                        <Divider />
                        <h3 className="font-bold text-xl mb-2">
                          Pernotes{" "}
                          <span className="font-semibold text-foreground-400">
                            (
                            {formatToCOP(
                              state.configuracion?.find(
                                (config) => config.nombre === "Pernote"
                              )?.valor || 0
                            )}
                            )
                          </span>
                        </h3>
                        <Divider />
                        {detalleVehiculo.pernotes?.map(
                          (pernote, pernoteIndex) => (
                            <div
                              key={`${pernote.empresa}-${pernoteIndex}`} // Combina la empresa y el índice para asegurarte de tener una clave única
                              className="grid sm:grid-cols-5 gap-4"
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
                                    selectedOption?.value || ""
                                  )
                                }
                                placeholder="Selecciona una empresa"
                                isSearchable
                                styles={selectStyles}
                                className="col-span-4 sm:col-span-3"
                              />

                              <Input
                                type="number"
                                label="Cantidad"
                                placeholder="0"
                                className="sm:col-span-2"
                                value={pernote.cantidad.toString()}
                                onChange={(e) => {
                                  const newCantidad = +e.target.value;
                                  let newFechas = [...pernote.fechas];
                                  if (newCantidad > pernote.fechas.length) {
                                    newFechas = [
                                      ...newFechas,
                                      ...Array(
                                        newCantidad - pernote.fechas.length
                                      ).fill(null),
                                    ];
                                  } else if (
                                    newCantidad < pernote.fechas.length
                                  ) {
                                    newFechas = newFechas.slice(0, newCantidad);
                                  }
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

                              {pernote.fechas?.map((fecha, dateIndex) => (
                                <DatePicker
                                  key={`${pernote.empresa}-${dateIndex}`} // Combina la empresa y el índice para asegurar una clave única
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
                                      const newFecha = dateToDateValue(jsDate);
                                      const newFechas = [...pernote.fechas];
                                      newFechas[dateIndex] = newFecha;
                                      handlePernoteChange(
                                        detalleVehiculo.vehiculo.value,
                                        pernoteIndex,
                                        "fechas",
                                        newFechas
                                      );
                                    }
                                  }}
                                />
                              ))}

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
                          className="w-full col-span-6 bg-primary-500 text-white"
                        >
                          Añadir pernote
                        </Button>

                        <Divider />

                        <h3 className="font-bold text-xl">Recargos</h3>
                        {detalleVehiculo.recargos?.map(
                          (recargo, recargoIndex) => (
                            <div
                              key={`${recargo.mes}-${recargo.empresa}-${recargoIndex}`} // Combina mes, empresa, e índice para asegurar clave única
                              className="grid grid-cols-4 gap-4 items-center"
                            >
                              <Select
                                label="Mes"
                                className="col-span-4 sm:col-span-1"
                                defaultSelectedKeys={
                                  recargo.mes ? [recargo.mes] : ""
                                }
                                onSelectionChange={(selected) => {
                                  const mes = Array.from(selected)[0];
                                  handleRecargoChange(
                                    detalleVehiculo.vehiculo.value,
                                    recargoIndex,
                                    "mes",
                                    mes
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
                                styles={selectStyles}
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
                          )
                        )}

                        <Button
                          onClick={() =>
                            handleAddRecargo(detalleVehiculo.vehiculo.value)
                          }
                          className="bg-primary-500 text-white"
                        >
                          Añadir recargo
                        </Button>
                      </CardBody>
                    </Card>
                  ))}
              </div>
            </form>
          )}

        <>
          {conductorSelected &&
            vehiculosSelected.length > 0 &&
            dateSelected && (
              <div
                className={`${state.allowEdit || state.allowEdit == null ? "" : "lg:w-2/3 xl:w-1/2 md:mx-auto"}`}
              >
                <ConductorInfo
                  conductor={
                    state.conductores.find(
                      (c) => c.id === conductorSelected?.value
                    ) || null
                  }
                  dateSelected={dateSelected}
                />

                <div className="w-full flex flex-col space-y-2">
                  <Tabs className="mx-auto" color="primary">
                    <Tab key={"liquidación"} title="Liquidación">
                      {detallesVehiculos?.map((detalle, index) => (
                        <CardLiquidacion
                          key={index}
                          detalleVehiculo={detalle}
                          empresas={state.empresas}
                        />
                      ))}
                      {conductorSelected &&
                        detallesVehiculos.length > 0 &&
                        dateSelected &&
                        state.vehiculos && (
                          <Card>
                            <CardHeader>
                              <p className="text-xl font-semibold">Resumen</p>
                            </CardHeader>
                            <Divider />
                            <CardBody className="space-y-4">
                              <Input
                                isDisabled={
                                  state.allowEdit || state.allowEdit == null
                                    ? false
                                    : true
                                }
                                value={diasLaborados.toString()}
                                onChange={(e) =>
                                  setDiasLaborados(+e.target.value)
                                }
                                type="number"
                                label="Cantidad días laborados"
                                placeholder="Ingresa la cantidad de días laborados"
                                className="max-w-xs"
                              />

                              <div className="space-y-4">
                                <div className="space-y-3">
                                  <Checkbox
                                    isDisabled={
                                      state.allowEdit || state.allowEdit == null
                                        ? false
                                        : true
                                    }
                                    isSelected={isCheckedAjuste}
                                    onChange={(e) =>
                                      setIsCheckedAjuste(e.target.checked)
                                    }
                                  >
                                    Bonificación Villanueva
                                  </Checkbox>

                                  {isCheckedAjuste && (
                                    <>
                                      <Input
                                        isDisabled={
                                          state.allowEdit ||
                                            state.allowEdit == null
                                            ? false
                                            : true
                                        }
                                        value={diasLaboradosVillanueva.toString()}
                                        onChange={(e) =>
                                          setDiasLaboradosVillanueva(
                                            +e.target.value
                                          )
                                        }
                                        type="number"
                                        label="Cantidad días laborados Villanueva"
                                        placeholder="Ingresa la cantidad de días laborados en villanueva"
                                        className="max-w-xs"
                                      />
                                      <div>
                                        <p>
                                          Bonificación villanueva{" "}
                                          <span className="text-sm text-foreground-500">
                                            (V/Día: {formatToCOP(ajustePorDia)})
                                          </span>
                                        </p>

                                        <p className="text-xl text-orange-400">
                                          {formatToCOP(bonificacionVillanueva)}{" "}
                                        </p>
                                      </div>
                                    </>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <Checkbox
                                    isDisabled={
                                      state.allowEdit || state.allowEdit == null
                                        ? false
                                        : true
                                    }
                                    isSelected={isVacaciones}
                                    onChange={(e) =>
                                      setIsVacaciones(e.target.checked)
                                    }
                                  >
                                    Vacaciones
                                  </Checkbox>

                                  {isVacaciones && (
                                    <>
                                      <DateRangePicker
                                        onChange={handleDateVacacionesChange}
                                        label="Periodo vacaciones"
                                        className="max-w-xs"
                                        lang="es-ES"
                                        value={periodoVacaciones}
                                      />

                                      <p className="font-semibold p-1">
                                        Días de vacaciones:{" "}
                                        <span className="font-normal">
                                          {obtenerDiferenciaDias(
                                            periodoVacaciones
                                          )}{" "}
                                          días
                                        </span>
                                      </p>
                                    </>
                                  )}
                                </div>

                                <div className="space-y-3">
                                  <Checkbox
                                    isDisabled={
                                      state.allowEdit || state.allowEdit == null
                                        ? false
                                        : true
                                    }
                                    isSelected={isCesantias}
                                    onChange={(e) =>
                                      setIsCesantias(e.target.checked)
                                    }
                                  >
                                    Cesantias
                                  </Checkbox>

                                  {isCesantias && (
                                    <>
                                      <Input
                                        isDisabled={
                                          state.allowEdit ||
                                            state.allowEdit == null
                                            ? false
                                            : true
                                        }
                                        value={diasLaboradosAnual.toString()}
                                        onChange={(e) =>
                                          setDiasLaboradosAnuales(
                                            +e.target.value
                                          )
                                        }
                                        type="number"
                                        label="Cantidad días laborados anual"
                                        placeholder="Ingresa la cantidad de días laborados en el año"
                                        className="max-w-xs"
                                      />
                                      <Input
                                        isDisabled={
                                          state.allowEdit ||
                                            state.allowEdit == null
                                            ? false
                                            : true
                                        }
                                        value={formatCurrency(cesantias)} // Muestra el valor solo cuando pagCliente es false
                                        onChange={(e) => {
                                          const inputVal = e.target.value.replace(
                                            /[^\d]/g,
                                            ""
                                          ); // Quitamos caracteres no numéricos
                                          const numericValue = +inputVal; // Convertimos el string limpio a número
                                          setCesantias(numericValue)
                                        }}
                                        
                                        type="text"
                                        label="Cesantias"
                                        placeholder="Ingresa el valor de las cesantias"
                                        className="max-w-xs"
                                      />
                                      <Input
                                        isDisabled={
                                          state.allowEdit ||
                                            state.allowEdit == null
                                            ? false
                                            : true
                                        }
                                        value={formatCurrency(interesCesantias)} // Muestra el valor solo cuando pagCliente es false
                                        onChange={(e) => {
                                          const inputVal = e.target.value.replace(
                                            /[^\d]/g,
                                            ""
                                          ); // Quitamos caracteres no numéricos
                                          const numericValue = +inputVal; // Convertimos el string limpio a número
        
                                          // Llamamos a handleRecargoChange con pagaCliente como false
                                         setInteresCesantias(numericValue)
                                        }}
                                        type="text"
                                        label="Interes cesantias"
                                        placeholder="Ingresa el valor de los intereses de las cesantias"
                                        className="max-w-xs"
                                      />
                                    </>
                                  )}
                                </div>
                              </div>

                              <Table shadow="none" aria-label="Resumen">
                                <TableHeader>
                                  <TableColumn className="bg-black text-white">
                                    CONCEPTO
                                  </TableColumn>
                                  <TableColumn className="bg-black text-white">
                                    VALOR
                                  </TableColumn>
                                </TableHeader>
                                <TableBody>
                                  <TableRow className="border-1">
                                    <TableCell>Salario devengado</TableCell>
                                    <TableCell>
                                      {formatToCOP(salarioDevengado)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1">
                                    <TableCell>Ajuste Villanueva</TableCell>
                                    <TableCell>
                                      {formatToCOP(bonificacionVillanueva)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1">
                                    <TableCell>Auxilio de transporte</TableCell>
                                    <TableCell>
                                      {formatToCOP(auxilioTransporte)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1">
                                    <TableCell>Bonificaciones</TableCell>
                                    <TableCell>
                                      {formatToCOP(totalBonificaciones)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1">
                                    <TableCell>Pernotes</TableCell>
                                    <TableCell>
                                      {formatToCOP(totalPernotes)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1">
                                    <TableCell>Recargos</TableCell>
                                    <TableCell>
                                      {formatToCOP(totalRecargos)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-orange-400 text-white">
                                    <TableCell>Vacaciones</TableCell>
                                    <TableCell>
                                      {formatToCOP(totalVacaciones || 0)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-blue-600 text-white">
                                    <TableCell>Cesantias</TableCell>
                                    <TableCell>
                                      {formatToCOP(cesantias)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-green-600 text-white">
                                    <TableCell>Interes cesantias</TableCell>
                                    <TableCell>
                                      {formatToCOP(interesCesantias)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-red-600 text-white">
                                    <TableCell>
                                      Salud (
                                      {state.configuracion?.find(
                                        (config) => config.nombre == "Salud"
                                      )?.valor || 0}
                                      %)
                                    </TableCell>
                                    <TableCell>{formatToCOP(salud)}</TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-red-600 text-white">
                                    <TableCell>
                                      Pensión (
                                      {state.configuracion?.find(
                                        (config) => config.nombre == "Pensión"
                                      )?.valor || 0}
                                      %)
                                    </TableCell>
                                    <TableCell>
                                      {formatToCOP(pension)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-red-600 text-white">
                                    <TableCell>Anticipos</TableCell>
                                    <TableCell>
                                      {formatToCOP(totalAnticipos)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow className="border-1 bg-black text-white">
                                    <TableCell className="text-xl">
                                      Sueldo total
                                    </TableCell>
                                    <TableCell className="text-xl">
                                      {formatToCOP(sueldoTotal)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>

                              {!state.allowEdit && state?.liquidacion?.id && (
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
                    </Tab>
                    <Tab
                      className="w-full lg:w-2/3 mx-auto"
                      key={"anticipos"}
                      title="Anticipos"
                    >
                      <Anticipos />
                    </Tab>
                  </Tabs>
                </div>
              </div>
            )}
        </>
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
  <div className="space-y-3 mt-2">
    <h3 className="text-xl font-bold">{title}</h3>
    <div>{formatFn(items)}</div>
  </div>
);

interface CardLiquidacionProps {
  detalleVehiculo: DetalleVehiculo;
  empresas: Empresa[]; // Añadimos las empresas como prop
}

const CardLiquidacion = ({
  detalleVehiculo,
  empresas,
}: CardLiquidacionProps) => {
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
        (total, pernote) => total + pernote.cantidad * pernote.valor,
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
    <Card className="mb-5">
      <CardHeader className="flex gap-3">
        <p className="text-xl font-bold">
          Vehículo:{" "}
          <b className="text-green-700">{detalleVehiculo.vehiculo.label}</b>
        </p>
      </CardHeader>
      <Divider />
      <CardBody className="gap-5 text-sm">
        <ListSection
          title="Bonificaciones"
          items={detalleVehiculo?.bonos}
          formatFn={() => {
            const isMobile = useMediaQuery("(max-width: 650px)"); // Tailwind `sm` breakpoint

            if (!isMobile) {
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
            } else {
              return (
                <div className="space-y-5">
                  {detalleVehiculo?.bonos.map((bono, index) => {
                    const total = bono.values.reduce(
                      (sum, val) => sum + val.quantity * bono.value,
                      0
                    );
                    return (
                      <Card key={index}>
                        <CardHeader className="font-bold">
                          {bono.name}
                        </CardHeader>
                        <Divider />
                        <CardBody className="">
                          {bono.values.map((val, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <p>{val.mes}</p>
                              <p>{val.quantity}</p>
                            </div>
                          ))}
                        </CardBody>
                        <Divider />
                        <CardFooter className="flex justify-between">
                          <p className="font-bold">Total</p>
                          <p className="text-green-700 font-bold">
                            {formatToCOP(total)}
                          </p>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              );
            }
          }}
        />

        <ListSection
          title="Mantenimientos"
          items={detalleVehiculo?.mantenimientos}
          formatFn={() => {
            const isMobile = useMediaQuery("(max-width: 650px)"); // Tailwind `sm` breakpoint

            if (!isMobile) {
              return (
                <table className="table-auto w-full text-sm mb-5">
                  <thead className="bg-default-500 text-white">
                    <tr>
                      {detalleVehiculo.mantenimientos[0]?.values.map((val, index) => (
                        <th key={index} className="px-4 py-2 text-center">
                          {val.mes}
                        </th>
                      ))}
                      <th className="px-4 py-2 text-center">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detalleVehiculo.mantenimientos.map((mantenimiento, index) => {
                      const total = mantenimiento.values.reduce(
                        (sum, val) => sum + val.quantity,
                        0
                      );
                      return (
                        <tr key={index}>
                          {mantenimiento.values.map((val, index) => (
                            <td
                              key={index}
                              className="border px-4 py-2 text-center"
                            >
                              {val.quantity}
                            </td>
                          ))}
                          <td className="border px-4 py-2 text-center text-green-500">
                            {total}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              );
            } else {
              return (
                <div className="space-y-5">
                  {detalleVehiculo?.mantenimientos.map((mantenimiento, index) => {
                    const total = mantenimiento.values.reduce(
                      (sum, val) => sum + val.quantity,
                      0
                    );
                    return (
                      <Card key={index}>
                        <CardBody className="">
                          {mantenimiento.values.map((val, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <p>{val.mes}</p>
                              <p>{val.quantity}</p>
                            </div>
                          ))}
                        </CardBody>
                        <Divider />
                        <CardFooter className="flex justify-between">
                          <p className="font-bold">Total</p>
                          <p className="text-green-700 font-bold">
                            {total}
                          </p>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              );
            }
          }}
        />

        <ListSection
          title="Pernotes"
          items={detalleVehiculo.pernotes}
          formatFn={(pernotes) => {
            const isMobile = useMediaQuery("(max-width: 650px)"); // Tailwind `sm` breakpoint

            if (Array.isArray(pernotes)) {
              // Generar una tabla general con los rows por cada pernote
              if (pernotes.length > 0) {
                if (!isMobile) {
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
                                {empresa
                                  ? empresa.Nombre
                                  : "Empresa no encontrada"}
                              </td>
                              <td className="border text-center text-primary-500">
                                {pernote?.fechas
                                  ?.sort(
                                    (a: string, b: string) =>
                                      new Date(a).getTime() -
                                      new Date(b).getTime()
                                  ) // Ordenar las fechas
                                  .map((fecha: any, index) => (
                                    <p key={index}>{fecha}</p>
                                  ))}
                              </td>
                              <td className="border px-4 py-2 text-center text-green-500">
                                {formatToCOP(
                                  pernote.cantidad * pernote.valor || 0
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  );
                } else {
                  return (
                    <div className="space-y-5">
                      {pernotes.map((pernote, index) => {
                        const empresa = empresas.find(
                          (empresa) => empresa.NIT === pernote.empresa
                        );

                        return (
                          <Card key={index}>
                            <CardHeader className="text-primary-500">
                              {empresa
                                ? empresa.Nombre
                                : "Empresa no encontrada"}
                            </CardHeader>
                            <Divider />
                            <CardBody>
                              <h4 className="font-bold">Fechas:</h4>
                              {pernote?.fechas
                                ?.sort(
                                  (a: string, b: string) =>
                                    new Date(a).getTime() -
                                    new Date(b).getTime()
                                ) // Ordenar las fechas
                                .map((fecha: any, idx) => (
                                  <p key={idx}>{fecha}</p>
                                ))}
                            </CardBody>
                            <Divider />
                            <CardFooter className="flex justify-between">
                              <p className="font-bold">Total</p>
                              <p className="text-green-700 font-bold">
                                {formatToCOP(
                                  pernote.cantidad * pernote.valor || 0
                                )}
                              </p>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  );
                }
              } else {
                return <p className="text-medium">No hay pernotes</p>;
              }
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

            const isMobile = useMediaQuery("(max-width: 650px)"); // Tailwind `sm` breakpoint

            if (Array.isArray(recargos)) {
              if (recargos.length > 0) {
                if (!isMobile) {
                  return (
                    <table className="table-auto w-full text-sm mb-5">
                      <thead className="bg-green-700 text-white">
                        <tr>
                          <th className="px-4 py-2 text-left">Empresa</th>
                          <th className="px-4 py-2 text-center">Mes</th>
                          <th className="px-4 py-2 text-center">Paga</th>
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
                                {empresa
                                  ? empresa.Nombre
                                  : "Empresa no encontrada"}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {recargo.mes}
                              </td>
                              <td className="border px-4 py-2 text-center">
                                {recargo.pagCliente ? "Cliente" : "Propietario"}
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
                } else {
                  return (
                    <div className="space-y-5">
                      {recargos.map((recargo, index) => {
                        const empresa = empresas.find(
                          (empresa) => empresa.NIT === recargo.empresa
                        );

                        return (
                          <Card key={index}>
                            <CardHeader className="text-primary-500">
                              {empresa
                                ? empresa.Nombre
                                : "Empresa no encontrada"}
                            </CardHeader>
                            <Divider />
                            <CardBody className="flex-row justify-between">
                              <p className="font-bold">Paga:</p>
                              <p>
                                {recargo.pagCliente ? "Cliente" : "Propietario"}
                              </p>
                            </CardBody>
                            <Divider />
                            <CardFooter className="flex justify-between">
                              <p className="font-bold">Total</p>
                              <p className="text-green-700 font-bold">
                                {formatToCOP(recargo.valor || 0)}
                              </p>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </div>
                  );
                }
              } else {
                return <p className="text-medium">No hay recargos</p>;
              }
            }

            // Si no es un array, regresamos null o algún valor por defecto
            return null;
          }}
        />
      </CardBody>
      <Divider />
      <CardFooter className="w-full space-y-2 flex flex-col px-0">
        <SummaryRow
          label="Total bonificaciones"
          value={formatToCOP(totalBonos)}
        />
        <SummaryRow label="Total pernotes" value={formatToCOP(totalPernotes)} />
        <SummaryRow label="Total recargos" value={formatToCOP(totalRecargos)} />
        <Divider />
        <div className="w-full flex justify-between text-2xl px-3">
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
  <div className="w-full flex justify-between px-3">
    <p className="font-semibold">{label}: </p>
    <p className="text-yellow-500">{value}</p>
  </div>
);