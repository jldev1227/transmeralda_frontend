import useVehiculo from "@/hooks/useVehiculo";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  CircularProgress,
} from "@nextui-org/react";
import { Chip } from "@nextui-org/chip";
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { Divider } from "@nextui-org/divider";
import { Tabs, Tab } from "@nextui-org/tabs";
// import { CustomPagingSlider } from "./CustomPagingSlider";
import { daysDifference, requiereTecnomecanica } from "./utils";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Card } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import Dropzone, { FileDetailsVehiculos } from "@/hooks/useDropzone";

export default function ModalVehiculo() {
  const { state, dispatch, actualizarVehiculo } = useVehiculo();
  const [editFile, setEditFile] = useState({
    label: "",
    visible: false,
  });
  const [file, setFile] = useState<FileDetailsVehiculos | null>(null);

  const handleModal = () => {
    dispatch({
      type: "SET_MODAL",
    });
  };

  const handleFilesUploaded = (
    fileDetails: FileDetailsVehiculos,
    realFile: File
  ) => {
    setFile({ ...fileDetails, realFile });
  };

  const handleFileRemoved = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      setEditFile({
        label: "",
        visible: false,
      });
      return;
    }

    try {
      await actualizarVehiculo(file); // Asegúrate de que actualizarVehiculo sea asíncrono

      setTimeout(() => {
        setEditFile({
          label: "",
          visible: false,
        });
        setFile(null);
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar el vehículo:", error);
      // Puedes manejar el error aquí si es necesario

      setTimeout(() => {
        setFile(null);
      }, 2000);
    }
  };

  const {
    placa = "",
    modelo = "",
    linea = "",
    marca = "",
    kilometraje = 0,
    soatVencimiento = "",
    tecnomecanicaVencimiento = "",
    fechaMatricula = "",
    conductor = null,
    estado = false,
    propietarioNombre = "",
    propietarioIdentificacion = "",
    galeria = [],
    color = "",
    claseVehiculo = "",
    tipoCarroceria = "",
    combustible = "",
  } = state?.vehiculo || {};

  const isMobile = useMediaQuery("(max-width: 560px)"); // Tailwind `sm` breakpoint

  const { alerta } = state;

  return (
    <Modal
      size={isMobile ? "full" : "2xl"}
      isOpen={state.modal}
      onOpenChange={handleModal}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-2">{placa}</ModalHeader>
            <ModalBody className="max-h-modal overflow-y-scroll">
              <Tabs className="mx-auto" color="primary" aria-label="Options">
                <Tab key="información" title="Información">
                  <div className="space-y-10">
                    <Card
                      className="flex justify-center items-center bg-cover bg-center"
                      style={{
                        backgroundImage: `url(/assets/${galeria.length > 0 ? galeria[0] : claseVehiculo !== "CAMIONETA" ? "empty_vehiculo_pesado.png" : "empty_vehiculo_liviano.png"})`,
                        backgroundSize: "70%", // Ajusta el tamaño para controlar la "lejanía" de la imagen
                        backgroundPosition: "center", // Centra la imagen en el Card
                        backgroundRepeat: "no-repeat", // Evita el efecto de mosaico
                        height: "250px",
                      }}
                    ></Card>

                    <div className="space-y-4">
                      <Card className="flex flex-col gap-2 p-5">
                        <h2 className="text-xl font-bold text-center mb-5">
                          Información básica
                        </h2>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">Marca</p>
                          <p>{marca}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">Línea</p>
                          <p>{linea}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">Modelo</p>
                          <p>{modelo}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">Color</p>
                          <p>{color}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">
                            Clase vehículo
                          </p>
                          <p>{claseVehiculo}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">
                            Tipo carroceria
                          </p>
                          <p>{tipoCarroceria}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">Combustible</p>
                          <p>{combustible}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">
                            Fecha matrícula
                          </p>
                          <p>{fechaMatricula}</p>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-lg font-semibold">Kilometraje</p>
                          <p>{kilometraje ?? 0} Km</p>
                        </div>
                      </Card>
                      <Divider />
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-center mb-5">
                          Documentación
                        </h2>

                        <Card>
                          <div className="flex flex-row p-3 max-sm:flex-col sm:justify-between sm:items-center gap-2">
                            <p className="text-lg font-semibold">
                              Vencimiento SOAT
                            </p>

                            {(() => {
                              const daysDiff = daysDifference(soatVencimiento);

                              const fillColor =
                                !soatVencimiento ||
                                isNaN(daysDiff) ||
                                daysDiff >= 0
                                  ? "danger"
                                  : "success"; // Asigna el color según la condición

                              return (
                                <div className="flex items-center gap-2">
                                  {soatVencimiento &&
                                    fillColor !== "success" && (
                                      <Popover color={fillColor}>
                                        <PopoverTrigger>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke={
                                              isNaN(daysDiff) || daysDiff > 0
                                                ? "red"
                                                : "orange"
                                            }
                                            className="size-6 cursor-pointer"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                            />
                                          </svg>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                          {
                                            !soatVencimiento ||
                                            isNaN(daysDiff) ||
                                            daysDiff >= 0
                                              ? "SOAT vencido" // Si es NaN o <= 0
                                              : "SOAT próximo a vencer" // Si es > 0
                                          }
                                        </PopoverContent>
                                      </Popover>
                                    )}

                                  <Chip radius="sm" color={fillColor}>
                                    {!soatVencimiento || isNaN(daysDiff)
                                      ? "No cuenta con SOAT"
                                      : soatVencimiento}
                                  </Chip>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="flex flex-row p-3 max-sm:flex-col sm:justify-between sm:items-center gap-2">
                            <p className="text-lg font-semibold">
                              Vencimiento tecnomecánica
                            </p>

                            {(() => {
                              const solicitarTecnomecanica =
                                requiereTecnomecanica(fechaMatricula);

                              // Determina el color y contenido del chip según el valor de solicitarTecnomecanica
                              const fillColor =
                                solicitarTecnomecanica &&
                                !tecnomecanicaVencimiento
                                  ? "danger"
                                  : "success";
                              const chipContent = solicitarTecnomecanica
                                ? "No cuenta con tecnomecánica"
                                : "No requiere tecnomecánica";

                              const daysDiff = daysDifference(
                                tecnomecanicaVencimiento
                              );
                              const expirationFillColor =
                                daysDiff > 0
                                  ? "danger"
                                  : daysDiff < -10
                                    ? "success"
                                    : "warning"; // Asigna el color según la condición

                              return (
                                <div className="flex items-center gap-2">
                                  {tecnomecanicaVencimiento &&
                                    expirationFillColor !== "success" && (
                                      <Popover color={expirationFillColor}>
                                        <PopoverTrigger>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke={
                                              daysDiff > 0 ? "red" : "orange"
                                            }
                                            className="size-6 cursor-pointer"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                            />
                                          </svg>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                          {daysDiff > 0
                                            ? "Tecnomecánica vencida"
                                            : "Tecnomecánica próxima a vencer"}
                                        </PopoverContent>
                                      </Popover>
                                    )}

                                  <Chip radius="sm" color={fillColor}>
                                    {tecnomecanicaVencimiento ?? chipContent}
                                  </Chip>
                                </div>
                              );
                            })()}
                          </div>
                        </Card>
                      </div>
                      <Divider />
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-center mb-5">
                          Información de servicio
                        </h2>

                        <Card className="p-3 space-y-3">
                          <div className="flex max-sm:flex-col sm:justify-between sm:items-center gap-2">
                            <p className="text-lg font-semibold">
                              Conductor asignado
                            </p>
                            <Chip
                              radius="sm"
                              className={`${conductor ? "bg-black text-white" : ""}`}
                            >
                              {conductor
                                ? `${conductor?.nombre} ${conductor?.apellido}`
                                : "Conductor no asignado"}
                            </Chip>
                          </div>
                          <div className="flex max-sm:flex-col sm:justify-between sm:items-center gap-2">
                            <p className="text-lg font-semibold">Estado</p>
                            <Chip
                              radius="sm"
                              color={`${
                                estado === "DISPONIBLE"
                                  ? "success"
                                  : estado === "MANTENIMIENTO"
                                    ? "primary"
                                    : "danger"
                              }`}
                            >
                              {estado}
                            </Chip>
                          </div>
                        </Card>
                      </div>
                      <Divider />
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-center mb-5">
                          Información del propietario
                        </h2>

                        <Card className="p-3 space-y-3">
                          <div className="flex max-sm:flex-col sm:justify-between sm:items-center gap-2">
                            <p className="text-lg font-semibold">Nombre</p>
                            <Chip radius="sm" color="primary">
                              {propietarioNombre}
                            </Chip>
                          </div>
                          <div className="flex max-sm:flex-col sm:justify-between sm:items-center gap-2">
                            <p className="text-lg font-semibold">
                              Identificación
                            </p>
                            <Chip radius="sm" color="primary">
                              {propietarioIdentificacion}
                            </Chip>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab key="documentos" title="Documentos">
                  {!editFile.visible ? (
                    <div
                      className={`grid ${
                        requiereTecnomecanica(fechaMatricula)
                          ? "grid-cols-3"
                          : "grid-cols-2"
                      } max-md:grid-cols-1 mx-auto gap-5`}
                    >
                      {(() => {
                        const titles = [
                          "TARJETA DE PROPIEDAD",
                          "SOAT",
                          requiereTecnomecanica(fechaMatricula)
                            ? "TECNOMECÁNICA"
                            : null,
                        ].filter(Boolean); // Filtra valores null o false para tener solo títulos válidos

                        const titlesHref = [
                          "TARJETA_DE_PROPIEDAD",
                          "SOAT",
                          "TECNOMECANICA",
                        ];

                        return titles.map((title, index) => (
                          <div
                            className="max-lg:w-2/3 max-lg:mx-auto shadow-md border-small rounded-lg hover:cursor-pointer"
                            key={index}
                            onClick={()=>{
                              window.open(
                                `${import.meta.env.VITE_AZURE_STORAGE_BLOB_URL}/${placa}/${placa}_${titlesHref[index]}.pdf?${import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN}`
                              );
                            }}
                          >
                            <div className="flex flex-col items-center gap-3 p-3">
                              <Image
                                style={{ objectFit: "contain" }}
                                src="/assets/pdfIcon.png"
                                width={42}
                                height={42}
                                alt="Pdf icon"
                              />
                              <p className="text-sm">{title}</p>
                            </div>
                            <div className="flex justify-center">
                              <Button
                                onPress={() => {
                                  setEditFile({
                                    visible: true,
                                    label: title ?? "",
                                  });
                                }}
                                className="w-5/6 mb-2"
                                color="secondary"
                              >
                                Actualizar
                              </Button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {state.loading ? (
                        <div className="flex flex-1 flex-col items-center justify-center p-5">
                          <CircularProgress
                            size="lg"
                            color="primary"
                            label="Actualizando documento..."
                            className="text-primary-500"
                          />
                        </div>
                      ) : (
                        !state.alerta && (
                          <>
                            <Dropzone
                              label={editFile.label}
                              onFileUploaded={handleFilesUploaded}
                              onFileRemoved={handleFileRemoved}
                            />
                            <Button
                              onPress={handleSubmit}
                              fullWidth
                              className={`text-white ${!file ? "bg-red-500" : "bg-purple-700"}`}
                            >
                              {!file ? "Cancelar" : "Realizar actualización"}
                            </Button>
                          </>
                        )
                      )}

                      {alerta && alerta.message ? (
                            alerta.success ? (
                              <div className="flex flex-1 flex-col items-center justify-center p-5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1}
                                  stroke="#22c55e" // Color green-500 de Tailwind
                                  className="size-24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                  />
                                </svg>

                                <p className="text-lg text-green-500 text-center">
                                  {alerta.message}
                                </p>
                              </div>
                            ) : (
                              <div className="flex flex-1 flex-col items-center justify-center p-5">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={1}
                                  stroke="red"
                                  className="size-24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                                  />
                                </svg>
                                <p className="text-lg text-blue-500 text-center">
                                  {alerta.message}
                                </p>
                              </div>
                            )
                          ) : null}
                    </div>
                  )}
                </Tab>
                {/* <Tab key="galeria" title="Galeria">
                  <CustomPagingSlider
                    images={Array.isArray(galeria) ? galeria : []}
                  />
                </Tab> */}
              </Tabs>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
