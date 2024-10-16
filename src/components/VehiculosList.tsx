import useVehiculo from "@/hooks/useVehiculo";
import { Button } from "@nextui-org/button";
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Chip } from "@nextui-org/chip";

export default function VehiculosList() {
  const { state, dispatch } = useVehiculo();

  return (
    <div className="space-y-5">
      <div className="flex justify-end max-md:justify-between max-md:w-full items-center gap-5">
        <Button onPress={()=>{
          dispatch({
            type: "SET_MODAL_ADD",
          })
        }} color="primary">+ Registrar vehiculo</Button>
        <div className="flex items-center gap-2">
          <Button isIconOnly>
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
                d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
              />
            </svg>
          </Button>
          <Button isIconOnly>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
              />
            </svg>
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
        {state.vehiculos.map((vehiculo) => (
          <Card key={vehiculo.id} isPressable className="py-4 hover:cursor-pointer">
            <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
              <p className="text-tiny uppercase font-bold">{vehiculo.linea}</p>
              <small className="text-default-500">{vehiculo.modelo}</small>
              <h4 className="font-bold text-large">{vehiculo.placa}</h4>
            </CardHeader>
            <CardBody className="overflow-visible py-2">
              <Image
                alt={`Foto vehiculo ${vehiculo.placa}`}
                className="object-cover rounded-xl"
                src={`/assets/${vehiculo.galeria.length > 0 ? vehiculo.galeria[0] : 'empty.jpg'}`}
                width={500}
                height={200}
              />
            </CardBody>
            <CardFooter className="flex-col items-start space-y-3">
              <div className="flex justify-between items-center w-full">
                <b>Kilometraje: </b>
                <p>{vehiculo.kilometraje || 0}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Chip radius="sm" className={`${vehiculo.conductorId ? 'bg-black text-white' : ''}`}>
                  {vehiculo.conductorId ? `${vehiculo.conductor?.nombre} ${vehiculo.conductor?.apellido}` : "Conductor no asignado"}
                </Chip>
                <Chip
                  radius="sm"
                  className={`${
                    vehiculo.disponibilidad === "ACTIVO"
                      ? "bg-success-100 text-success-500"
                      : vehiculo.disponibilidad === "MANTENIMIENTO"
                        ? "bg-primary-100 text-primary-500"
                        : "bg-danger-100 text-danger-500"
                  }`}
                >
                  {vehiculo.disponibilidad}
                </Chip>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
