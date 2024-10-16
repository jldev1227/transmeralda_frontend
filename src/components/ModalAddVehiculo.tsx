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
import { Button } from '@nextui-org/button'

export default function ModalAddVehiculo() {
  const { state, dispatch, agregarVehiculo } = useVehiculo();
  const [files, setFiles] = useState<FileDetailsVehiculos[]>([]);

  const handleModal = () => {
    dispatch({
      type: "SET_MODAL_ADD",
    });
  };

  const handleFilesUploaded = (newFile: FileDetailsVehiculos) => {
    setFiles((prevState) => [...prevState, newFile]);
  };

  const handleFileRemoved = (fileId: string) => {
    setFiles((prevState) => prevState.filter((file) => file.id !== fileId));
  };

  const handleSubmit = async () => {
    await agregarVehiculo(files);
  };

  return (
    <Modal size="xl" isOpen={state.modalAdd} onOpenChange={handleModal}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Registrar vehiculo
            </ModalHeader>
            <ModalBody className="p-6">
              <Dropzone label={'Tarjeta de propiedad'} onFileUploaded={handleFilesUploaded} onFileRemoved={handleFileRemoved} />
              <Dropzone label={'SOAT'} onFileUploaded={handleFilesUploaded} onFileRemoved={handleFileRemoved} />
              <Dropzone label={'Técnicomecánica'} onFileUploaded={handleFilesUploaded} onFileRemoved={handleFileRemoved} />
            </ModalBody>
            <ModalFooter>
              <Button onPress={handleSubmit} isDisabled={files.length === 0} fullWidth className="bg-green-700 text-white">
                Realizar registro
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
