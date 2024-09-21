import useLiquidacion from "@/hooks/useLiquidacion";
import { Button } from "@nextui-org/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/modal";

export default function ModalLiquidacion() {
  const { state, dispatch } = useLiquidacion();

  const handleModal = () => {
    dispatch({
        type: 'SET_MODAL'
    })
  }

  const { liquidacion } = state

  return (
    <Modal
      isOpen={state.modal}
      placement="bottom"
      onOpenChange={handleModal}
    >
      <ModalContent>
        {(onClose : void) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Liquidación #{liquidacion?.id}
            </ModalHeader>
            <ModalBody>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                pulvinar risus non risus hendrerit venenatis. Pellentesque sit
                amet hendrerit risus, sed porttitor quam.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam
                pulvinar risus non risus hendrerit venenatis. Pellentesque sit
                amet hendrerit risus, sed porttitor quam.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={onClose}>
                Action
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
