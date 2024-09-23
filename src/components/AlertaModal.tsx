import useLiquidacion from "@/hooks/useLiquidacion";
import { Modal, ModalContent, ModalBody } from "@nextui-org/react";

export default function AlertaModal() {
  const { state, dispatch } = useLiquidacion();

  const handleModal = () => {
    dispatch({
      type: "RESET_ALERTA",
    });
  };

  const { visible, success, mensaje } = state.alerta

  return (
    <div>
      <Modal
        size="xs"
        placement="center"
        isOpen={visible}
        onOpenChange={handleModal}
      >
        <ModalContent>
          {() => (
            <>
              <ModalBody>
                <div className="flex flex-col items-center p-3 gap-2">
                  {state.alerta.success ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-10 text-green-700" 
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-10 text-red-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  )}
                  <p className={`text-semibold text-md ${success ? 'text-green-700' : 'text-red-700'}`}>
                    {mensaje}
                  </p>
                </div>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
