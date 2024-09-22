import { formatDate } from "@/helpers";
import useLiquidacion from "@/hooks/useLiquidacion";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";
import { useEffect, useState } from "react";
import PdfMaker from "./pdfMaker";

export default function ModalLiquidacion() {
  const { state, dispatch } = useLiquidacion();

  const handleModal = () => {
    dispatch({
      type: "SET_MODAL",
    });
  };

  function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
      const media = window.matchMedia(query);

      // Verifica si la consulta media coincide
      if (media.matches !== matches) {
        setMatches(media.matches);
      }

      const listener = (event: MediaQueryListEvent) => {
        setMatches(event.matches);
      };

      // Usar `addEventListener` en lugar de `addListener`
      media.addEventListener("change", listener);

      return () => {
        // Usar `removeEventListener` en lugar de `removeListener`
        media.removeEventListener("change", listener);
      };
    }, [matches, query]);

    return matches;
  }

  const isMobile = useMediaQuery("(max-width: 640px)"); // Tailwind `sm` breakpoint

  const { liquidacion } = state;

  return (
    <Modal
      isOpen={state.modal}
      placement={isMobile ? "bottom" : "center"}
      onOpenChange={handleModal}
    >
      <ModalContent>
        {(onClose: () => void) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Liquidación #{liquidacion?.id}
            </ModalHeader>
            <ModalBody>
              <div>
                <b>Conductor</b>
                <p>
                  {liquidacion?.conductor.nombre}{" "}
                  {liquidacion?.conductor.apellido}
                </p>
              </div>
              <div>
                <b>Periodo</b>
                <p>
                  {formatDate(liquidacion?.periodoStart)} -{" "}
                  {formatDate(liquidacion?.periodoEnd)}
                </p>
              </div>
              <div>
                <b>Días trabajados</b>
                <p>{liquidacion?.diasLaborados}</p>
              </div>
              <div>
                <b>Vehiculos</b>
                {liquidacion?.vehiculos?.map((vehiculo) => (
                  <p key={vehiculo?.id}>{vehiculo?.placa}</p>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <PdfMaker item={state.liquidacion}>Desprendible de nomina</PdfMaker>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
