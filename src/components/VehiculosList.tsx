import { useState, useMemo } from "react";
import useVehiculo from "@/hooks/useVehiculo";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";
import { daysDifference, requiereTecnomecanica } from "./utils";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { RadioGroup, Radio } from "@nextui-org/react";

export default function VehiculosList() {
  const { state, dispatch } = useVehiculo();

  // Estado para los filtros seleccionados
  const [selectedStates, setSelectedStates] = useState([
    "disponible",
    "no-disponible",
    "inactivo",
    "mantenimiento",
  ]);

  const [sortOption, setSortOption] = useState("placa-az");

  if (!state.vehiculos) return <p>Obteniendo vehículos...</p>;

  // Filtrar y ordenar vehículos con `useMemo` para evitar ciclos
  const sortedVehiculos = useMemo(() => {
    const filtered = state.vehiculos.filter((vehiculo) =>
      selectedStates.includes(vehiculo.estado.toLowerCase())
    );

   
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "placa-az":
          const sortedAZ = [...filtered].sort((a, b) => a.placa.localeCompare(b.placa)); // Ordena A-Z
          console.log("Ordenado por Placa (A-Z):", sortedAZ);
          return a.placa.localeCompare(b.placa);
        case "placa-za":
          const sortedZA = [...filtered].sort((a, b) => b.placa.localeCompare(a.placa)); // Ordena Z-A
          console.log("Ordenado por Placa (Z-A):", sortedZA);
          return b.placa.localeCompare(a.placa);
        case "kilometraje-mayor":
          const sortedKilometrajeMayor = [...filtered].sort((a, b) => Number(b.kilometraje) - Number(a.kilometraje)); // Mayor a menor
          console.log("Ordenado por Kilometraje (Mayor a Menor):", sortedKilometrajeMayor);
          return Number(b.kilometraje) - Number(a.kilometraje);
        case "kilometraje-menor":
          const sortedKilometrajeMenor = [...filtered].sort((a, b) => Number(a.kilometraje) - Number(b.kilometraje)); // Menor a mayor
          console.log("Ordenado por Kilometraje (Menor a Mayor):", sortedKilometrajeMenor);
          return Number(a.kilometraje) - Number(b.kilometraje);
        case "disponibilidad-disponible":
          const sortedDisponibles = [...filtered].sort((a, b) =>
            a.estado === "DISPONIBLE" ? -1 : 1
          ); // "DISPONIBLE" primero
          console.log("Ordenado por Disponibilidad (Disponible primero):", sortedDisponibles);
          return a.estado === "DISPONIBLE" ? -1 : 1;
        case "disponibilidad-no-disponible":
          const sortedNoDisponibles = [...filtered].sort((a, b) =>
            a.estado === "NO DISPONIBLE" ? -1 : 1
          ); // "NO DISPONIBLE" primero
          console.log("Ordenado por Disponibilidad (No disponible primero):", sortedNoDisponibles);
          return a.estado === "NO DISPONIBLE" ? -1 : 1;
        default:
          console.log("Sin orden específico:", filtered);
          return 0; // Sin ordenación
      }
    });
    
  }, [state.vehiculos, selectedStates, sortOption]);

  return (
    <div className="grid grid-cols-4 gap-5 space-y-5">
      <div className="col-span-1 space-y-10 p-5 rounded-lg">
        <Button
          fullWidth
          onPress={() => {
            dispatch({
              type: "SET_MODAL_ADD",
            });
          }}
          variant="bordered"
          color="success"
        >
          + Registrar vehiculo
        </Button>
        <div>
          <form>
            <fieldset className="space-y-5">
              <legend className="font-semibold text-2xl">Filtros</legend>
              <div>
                <CheckboxGroup
                  label="Selecciona estados"
                  value={selectedStates} // Conecta el estado de filtros
                  onChange={setSelectedStates} // Actualiza el estado al cambiar
                >
                  <Checkbox value="disponible">Disponible</Checkbox>
                  <Checkbox value="no-disponible">No disponible</Checkbox>
                  <Checkbox value="mantenimiento">Mantenimiento</Checkbox>
                  <Checkbox value="inactivo">Inactivo</Checkbox>
                  <Checkbox value="documentación">
                    Requiere documentación
                  </Checkbox>
                </CheckboxGroup>
              </div>
            </fieldset>
          </form>
        </div>
        <div>
          <form>
            <fieldset className="space-y-5">
              <legend className="font-semibold text-2xl">Ordenar</legend>
              <div>
                <RadioGroup
                  label="Selecciona método de ordenación"
                  value={sortOption} // Conecta el estado directamente
                  onChange={(e) => setSortOption(e.target.value)} // Actualiza directamente con el nuevo valor
                >
                  <Radio value="placa-az">Placa (A-Z)</Radio>
                  <Radio value="placa-za">Placa (Z-A)</Radio>
                  <Radio value="kilometraje-mayor">
                    Kilometraje (Mayor a Menor)
                  </Radio>
                  <Radio value="kilometraje-menor">
                    Kilometraje (Menor a Mayor)
                  </Radio>
                  <Radio value="disponibilidad-disponible">
                    Disponibilidad (Disponible primero)
                  </Radio>
                  <Radio value="disponibilidad-no-disponible">
                    Disponibilidad (No disponible primero)
                  </Radio>
                </RadioGroup>
              </div>
            </fieldset>
          </form>
        </div>
      </div>

      <div className="col-span-3 grid md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
        {sortedVehiculos.length > 0 ? (
          sortedVehiculos
            .map((vehiculo) => (
              <Card
                key={vehiculo.id}
                isPressable
                onPress={() => {
                  dispatch({
                    type: "SELECT_VEHICULO",
                    payload: vehiculo.id,
                  });
                  dispatch({
                    type: "SET_MODAL",
                  });
                }}
                className="py-4 hover:cursor-pointer"
              >
                <CardHeader className="pb-0 pt-2 px-4 justify-between items-start">
                  <div className="flex flex-col items-start">
                    <p className="text-tiny uppercase font-bold">
                      {vehiculo.linea}
                    </p>
                    <small className="text-default-500">
                      {vehiculo.modelo}
                    </small>
                    <h4 className="font-bold text-large">{vehiculo.placa}</h4>
                  </div>
                  {(() => {
                    const solicitarTecnomecanica = requiereTecnomecanica(
                      vehiculo.fechaMatricula
                    );

                    if (vehiculo.soatVencimiento && !solicitarTecnomecanica) {
                      return null;
                    }

                    const daysDiffSoat = daysDifference(
                      vehiculo.soatVencimiento
                    );
                    const daysDiffTecnomecanica = daysDifference(
                      vehiculo.tecnomecanicaVencimiento
                    );

                    if (daysDiffSoat < -10 && daysDiffTecnomecanica < -10)
                      return null;

                    const fillColor =
                      daysDiffSoat > 0 || daysDiffTecnomecanica > 0
                        ? "red"
                        : "#ea8b2d";

                    return (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill={fillColor}
                        className="size-8"
                      >
                        <path
                          fillRule="evenodd"
                          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    );
                  })()}
                </CardHeader>
                <CardBody className="overflow-visible py-2">
                  <Image
                    alt={`Foto vehiculo ${vehiculo.placa}`}
                    className="object-cover rounded-xl"
                    src={`/assets/${
                      vehiculo.galeria.length > 0
                        ? vehiculo.galeria[0]
                        : vehiculo.claseVehiculo !== "CAMIONETA"
                          ? "empty_vehiculo_pesado.png"
                          : "empty_vehiculo_liviano.png"
                    }`}
                    width={300}
                    height={200}
                  />
                </CardBody>
                <CardFooter className="flex-col items-start space-y-3">
                  <div className="flex justify-between items-center w-full">
                    <b>Kilometraje: </b>
                    <p>{vehiculo.kilometraje}Km</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Chip
                      radius="sm"
                      className={`${
                        vehiculo.conductor ? "bg-black text-white" : ""
                      }`}
                    >
                      {vehiculo.conductor
                        ? `${vehiculo.conductor?.nombre} ${vehiculo.conductor?.apellido}`
                        : "Conductor no asignado"}
                    </Chip>
                    <Chip
                      radius="sm"
                      color={`${
                        vehiculo.estado === "DISPONIBLE"
                          ? "success"
                          : vehiculo.estado === "MANTENIMIENTO"
                            ? "primary"
                            : "danger"
                      }`}
                    >
                      {vehiculo.estado}
                    </Chip>
                  </div>
                </CardFooter>
              </Card>
            ))
        ) : (
          // Mensaje de "No hay vehículos para mostrar"
          <p className="text-center text-lg font-semibold">
            No hay vehículos para mostrar.
          </p>
        )}
      </div>
    </div>
  );
}
