import useLiquidacion from "@/hooks/useLiquidacion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { ChangeEvent, useEffect, useState } from "react";
import { ConfiguracionLiquidacion } from "@/types";

export default function ModalConfiguracionLiquidador() {
  const { state, dispatch, handleActualizarConfiguracion } = useLiquidacion();
  const [configuracion, setConfiguracion] = useState<ConfiguracionLiquidacion[]>([]);


  // Sincroniza la configuración inicial con el estado de redux o el contexto
  useEffect(() => {
    setConfiguracion(state.configuracion || []);
  }, [state.configuracion]);

  // Manejar el cierre del modal
  const handleModal = () => {
    dispatch({
      type: "SET_MODAL_CONFIGURACION",
    });
  };

  // Manejador para el cambio de valores en los inputs
  const handleOnChange = (
    e: ChangeEvent<HTMLInputElement>,
    id: ConfiguracionLiquidacion["id"]
  ) => {
    const { value } = e.target;

    // Actualizar la configuración en el estado basada en el ID
    setConfiguracion((prevState) =>
      prevState.map((field) =>
        field.id === id
          ? { ...field, valor: parseFloat(value) || 0} // Actualizamos el valor del campo
          : field
      )
    );
  };

  // Guardar la configuración al cerrar el modal
  const handleGuardar = async () => {
    try {
      await handleActualizarConfiguracion(configuracion); // Pasa el array de configuraciones
    } catch (error) {
      console.error("Error al actualizar las configuraciones:", error);
    }
  };

  return (
    <>
      <Modal placement="center" size="xs" isOpen={state.modalConfiguracion} onOpenChange={handleModal}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Configuración
              </ModalHeader>
              <ModalBody>
                {configuracion.map((field) => (
                  <Input
                    key={field.id}
                    label={field.nombre}
                    value={field.valor.toString()}
                    onChange={(e) => handleOnChange(e, field.id)}
                  />
                ))}
              </ModalBody>
              <ModalFooter>
                <Button
                  color="primary"
                  className="w-full"
                  onPress={handleGuardar}
                >
                  Guardar configuración
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
