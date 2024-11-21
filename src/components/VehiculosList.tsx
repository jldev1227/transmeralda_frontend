import { useState, useMemo } from "react";
import useVehiculo from "@/hooks/useVehiculo";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";
import { daysDifference, requiereTecnomecanica } from "./utils";
import { CheckboxGroup, Checkbox } from "@nextui-org/checkbox";
import { RadioGroup, Radio } from "@nextui-org/react";
import { Input } from "@nextui-org/input";
import { SearchIcon } from "./SearchIcon";

export default function VehiculosList() {
  const { state, dispatch } = useVehiculo();

  // Estado para los filtros seleccionados
  const [selectedStates, setSelectedStates] = useState([
    "disponible",
    "no disponible",
    "inactivo",
    "mantenimiento",
    "documentación",
    "camioneta",
    "bus"
  ]);

  const [sortOption, setSortOption] = useState("placa-az");
  const [search, setSearch] = useState("");

  if (!state.vehiculos) return <p>Obteniendo vehículos...</p>;

  // Filtrar y ordenar vehículos con `useMemo` para evitar ciclos
  const sortedVehiculos = useMemo(() => {
    const filtered = state.vehiculos.filter((vehiculo) => {
      // Verificar si "documentación" está en los estados seleccionados
      const requiereDocumentacion =
        !vehiculo.soatVencimiento ||
        (!vehiculo.tecnomecanicaVencimiento &&
          requiereTecnomecanica(vehiculo.fechaMatricula));

      if (search) {
        return vehiculo.placa.toLowerCase().includes(search.toLowerCase());
      }

      // Filtrar por estados seleccionados
      if (selectedStates.includes("camioneta")) {
        if (vehiculo.claseVehiculo !== "CAMIONETA") {
          return false;
        }
      } else {
        if (vehiculo.claseVehiculo === "CAMIONETA") {
          return false;
        }
      }

      if (selectedStates.includes("documentación")) {
        // Si solo "documentación" está seleccionada
        if (selectedStates.length === 1) {
          return requiereDocumentacion;
        }
        // Si "documentación" está seleccionada junto con otros estados
        return (
          requiereDocumentacion ||
          selectedStates.includes(vehiculo.estado.toLowerCase())
        );
      }



      // Filtrar normalmente por los estados seleccionados
      return selectedStates.includes(vehiculo.estado.toLowerCase());
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "placa-az":
          return a.placa.localeCompare(b.placa);
        case "placa-za":
          return b.placa.localeCompare(a.placa);
        case "kilometraje-mayor":
          return Number(b.kilometraje) - Number(a.kilometraje);
        case "kilometraje-menor":
          return Number(a.kilometraje) - Number(b.kilometraje);
        case "disponibilidad-disponible":
          return a.estado === "DISPONIBLE" ? -1 : 1;
        case "disponibilidad-no-disponible":
          return a.estado === "NO DISPONIBLE" ? -1 : 1;
        case "modelo-reciente":
          return a.modelo > b.modelo ? -1 : 1;
        case "modelo-antiguo":
          return b.modelo > a.modelo ? -1 : 1;
        default:
          return 0; // Sin ordenación
      }
    });
  }, [state.vehiculos, selectedStates, sortOption, search]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-10">
      <div className="col-span-1 space-y-10 rounded-lg">
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
          <div className="space-y-10">
            <fieldset className="space-y-5">
              <legend className="font-semibold text-2xl">Busqueda</legend>
              <Input
                isClearable
                radius="lg"
                placeholder="Busca por placa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                onClear={() => setSearch("")} // Agregamos esta función para manejar el evento de limpiar
                startContent={
                  <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
                }
              />
            </fieldset>
            <fieldset className="space-y-5">
              <legend className="font-semibold text-2xl">Filtros</legend>
              <div className="space-y-4">
                <CheckboxGroup
                  label="Selecciona estados"
                  value={selectedStates} // Conecta el estado de filtros
                  onChange={setSelectedStates} // Actualiza el estado al cambiar
                >
                  <Checkbox value="disponible">Disponible ({state.vehiculos.filter(vehiculo => vehiculo.estado === "DISPONIBLE").length})</Checkbox>
                  <Checkbox value="no disponible">No disponible ({state.vehiculos.filter(vehiculo => vehiculo.estado === "NO DISPONIBLE").length})</Checkbox>
                  <Checkbox value="mantenimiento">Mantenimiento ({state.vehiculos.filter(vehiculo => vehiculo.estado === "MANTENIMIENTO").length})</Checkbox>
                  <Checkbox value="inactivo">Inactivo ({state.vehiculos.filter(vehiculo => vehiculo.estado === "INACTIVO").length})</Checkbox>
                  <Checkbox value="documentación">
                    Requiere documentación ({state.vehiculos.filter(vehiculo =>
                      !vehiculo.soatVencimiento ||
                      (!vehiculo.tecnomecanicaVencimiento &&
                        requiereTecnomecanica(vehiculo.fechaMatricula))
                    ).length})
                  </Checkbox>
                </CheckboxGroup>
                <CheckboxGroup
                  label="Selecciona clase vehículo"
                  value={selectedStates} // Conecta el estado de filtros
                  onChange={setSelectedStates} // Actualiza el estado al cambiar
                >
                  <Checkbox value="camioneta">Camioneta ({state.vehiculos.filter(vehiculo => vehiculo.claseVehiculo === "CAMIONETA").length})</Checkbox>
                  <Checkbox value="bus">Bus ({state.vehiculos.filter(vehiculo => vehiculo.claseVehiculo !== "CAMIONETA").length})</Checkbox>
                </CheckboxGroup>
              </div>
            </fieldset>
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
                  <Radio value="modelo-reciente">
                    Modelo (reciente primero)
                  </Radio>
                  <Radio value="modelo-antiguo">
                    Modelo (antiguo primero)
                  </Radio>
                </RadioGroup>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="xl:col-span-3 space-y-2">
        <h2 className="font-semibold text-lg">Vehículos registrados:{" "}
          <span className="font-normal">{state.vehiculos.length}</span>
        </h2>
        <div className="max-lg:mx-auto grid sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 place-self-start max-md:place-self-center">
          {sortedVehiculos.length > 0 ? (
            sortedVehiculos.map((vehiculo) => (
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
                    <small className="text-default-500">{vehiculo.modelo}</small>
                    <h4 className="font-bold text-large">{vehiculo.placa}</h4>
                  </div>
                  {(() => {
                    const solicitarTecnomecanica = requiereTecnomecanica(
                      vehiculo.fechaMatricula
                    );

                    if (vehiculo.soatVencimiento && !solicitarTecnomecanica) {
                      return null;
                    }

                    const daysDiffSoat = daysDifference(vehiculo.soatVencimiento);
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
                    src={`/assets/${vehiculo.galeria.length > 0
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
                      className={`${vehiculo.conductor ? "bg-black text-white" : ""
                        }`}
                    >
                      {vehiculo.conductor
                        ? `${vehiculo.conductor?.nombre} ${vehiculo.conductor?.apellido}`
                        : "Conductor no asignado"}
                    </Chip>
                    <Chip
                      radius="sm"
                      color={`${vehiculo.estado === "DISPONIBLE"
                        ? "success"
                        : vehiculo.estado === "MANTENIMIENTO"
                          ? "primary"
                          : vehiculo.estado === "NO DISPONIBLE" ? "danger" : "default"
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
            <p className="col-span-3 text-lg">
              {state.vehiculos.length === 0 ? "No hay vehículos registrados." : selectedStates.length !== 7 && sortedVehiculos.length === 0 && "No hay vehículos para mostrar según los filtros."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}