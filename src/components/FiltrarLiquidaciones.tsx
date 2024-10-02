import { mesesDelAño } from "@/data/meses";
import useLiquidacion from "@/hooks/useLiquidacion";
import { selectStyles } from "@/styles/selectStyles";
import { VehiculoOption } from "@/types";
import { Select, SelectItem } from "@nextui-org/select";
import { useCallback, useEffect, useMemo, useState } from "react";
import SelectReact, { SingleValue } from "react-select";

export default function FiltrarLiquidaciones() {
  const { state } = useLiquidacion();
  const [vehiculoSelected, setVehiculoSelected] =
    useState<SingleValue<VehiculoOption>>(null);
  const [mesSelected, setMesSelected] = useState<SingleValue<string>>(null);

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

    // Hacer algo con 'conductores', como almacenarlos o mostrarlos
  }, [state.liquidaciones, vehiculoSelected, mesSelected]);

  // Ejecutar handleFilter cuando cambien vehiculoSelected o dateSelected
  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  return (
    <div className="space-y-20 grid grid-cols-1 place-items-center">
      <div className="flex flex-col items-center w-full space-y-3">
        <SelectReact
          className="max-w-xs w-full"
          options={vehiculosOptions}
          value={vehiculoSelected}
          onChange={(selectedOption) => handleVehiculoSelect(selectedOption)}
          placeholder="Seleccione la placa"
          isSearchable
          styles={selectStyles}
        />
        <Select
          label="Selecciona un mes"
          className="max-w-xs"
          onChange={(e) => setMesSelected(e.target.value)}
        >
          {mesesDelAño.map((mes) => (
            <SelectItem key={mes.value} value={mes.value}>
              {mes.label}
            </SelectItem>
          ))}
        </Select>
      </div>
      {vehiculoSelected && mesSelected && (
        <div>
          <h2>Vehiculo {vehiculoSelected}</h2>
          <table className="table-auto w-full text-sm mb-5">
            <thead className="bg-yellow-500 text-white">
              <tr>
                <th className="px-4 py-2 text-left">Conductor</th>
                <th className="px-4 py-2 text-center">Total</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        </div>
      )}
    </div>
  );
}
