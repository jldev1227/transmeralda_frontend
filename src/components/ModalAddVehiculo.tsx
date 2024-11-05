import Dropzone, { FileDetailsVehiculos } from "@/hooks/useDropzone";
import useVehiculo from "@/hooks/useVehiculo";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { useState } from "react";
import { Button } from "@nextui-org/button";
import { CircularProgress } from "@nextui-org/react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export default function ModalAddVehiculo() {
  const { state, dispatch, agregarVehiculo } = useVehiculo();
  const [files, setFiles] = useState<FileDetailsVehiculos[]>([]);

  const handleModal = () => {
    dispatch({
      type: "SET_MODAL_ADD",
    });
  };

  const handleFilesUploaded = (
    fileDetails: FileDetailsVehiculos,
    realFile: File
  ) => {
    setFiles((prevFiles) => [
      ...prevFiles,
      { ...fileDetails, realFile }, // Guardamos tanto los detalles como el archivo real
    ]);
  };

  const handleFileRemoved = (fileId: string) => {
    setFiles((prevState) => prevState.filter((file) => file.id !== fileId));
  };

  const handleSubmit = async () => {
    await agregarVehiculo(files);
  };

  const isMobile = useMediaQuery("(max-width: 560px)"); // Tailwind `sm` breakpoint

  return (
    <Modal
      size={isMobile ? "full" : "xl"}
      isOpen={state.modalAdd}
      onOpenChange={handleModal}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Registrar vehiculo
            </ModalHeader>
            <ModalBody className="max-sm:overflow-y-scroll">
              {state.loading ? (
                <div className="flex flex-1 flex-col items-center justify-center">
                  <CircularProgress
                    size="lg"
                    color="success"
                    label="Registrando vehículo..."
                    className="text-green-500"
                  />
                </div>
              ) : (
                !state.alerta && (
                  <>
                    <Dropzone
                      label={"TARJETA DE PROPIEDAD"}
                      onFileUploaded={handleFilesUploaded}
                      onFileRemoved={handleFileRemoved}
                    />
                    <Dropzone
                      label={"SOAT"}
                      onFileUploaded={handleFilesUploaded}
                      onFileRemoved={handleFileRemoved}
                    />
                    <Dropzone
                      label={"TECNOMECÁNICA"}
                      onFileUploaded={handleFilesUploaded}
                      onFileRemoved={handleFileRemoved}
                    />
                  </>
                )
              )}

              {state.alerta && state.alerta.message ? (
                state.alerta.success ? (
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
                      {state.alerta.message}
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
                    <p className="text-lg text-red-500 text-center">
                      {state.alerta.message}
                    </p>
                  </div>
                )
              ) : null}
            </ModalBody>

            {!state.loading && !state.alerta && (
              <ModalFooter>
                <Button
                  onPress={handleSubmit}
                  isDisabled={files.length === 0}
                  fullWidth
                  className="bg-green-700 text-white"
                >
                  Realizar registro
                </Button>
              </ModalFooter>
            )}
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
