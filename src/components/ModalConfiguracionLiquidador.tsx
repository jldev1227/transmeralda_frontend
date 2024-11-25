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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatCurrency } from "@/helpers";

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
    const inputVal = e.target.value.replace(
      /[^\d]/g,
      ""
    ); // Quitamos caracteres no numéricos
    const numericValue = inputVal; // Convertimos el string limpio a número

    // Actualizar la configuración en el estado basada en el ID
    setConfiguracion((prevState) =>
      prevState.map((field) =>
        field.id === id
          ? { ...field, valor: parseFloat(numericValue) || 0} // Actualizamos el valor del campo
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

  const isMobile = useMediaQuery("(max-width: 560px)"); // Tailwind `sm` breakpoint

  return (
    <>
      <Modal 
        size={isMobile ? "full" : "sm"}
        isOpen={state.modalConfiguracion} 
        onOpenChange={handleModal}
      >
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
                 startContent={field.nombre === 'Pensión' || field.nombre === 'Salud' ? '%' : '$'}
                 onChange={(e) => handleOnChange(e, field.id)}
                 value={
                   field.valor !== 0 // Comprobar si el valor no es igual a 0
                     ? (field.nombre === "Pensión" || field.nombre === "Salud") // Condición para 'Pensión' o 'Salud'
                       ? field.valor.toString() // Formatear el valor si cumple la condición
                       : formatCurrency(field.valor).split('$')[1] // Convertir a string si no es 'Pensión' ni 'Salud'
                     : "" // Si el valor es 0, mostrar un string vacío
                 }
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
