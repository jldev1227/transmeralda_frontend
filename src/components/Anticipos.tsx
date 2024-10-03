import { formatCurrency, formatToCOP } from "@/helpers";
import useLiquidacion from "@/hooks/useLiquidacion";
import { Anticipo } from "@/types";
import { Input } from "@nextui-org/input";
import { Tooltip } from "@nextui-org/tooltip";
import { Button } from "@nextui-org/button";
import { FormEvent, useState } from "react";

export default function Anticipos() {
  const { state, agregarAnticipos, eliminarAnticipo } = useLiquidacion();
  const [anticipos, setAnticipos] = useState<Anticipo[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const { liquidacion } = state;

  // Maneja el cambio en el input
  const handleAnticipoChange = (
    index: number,
    field: keyof Anticipo,
    value: string | number
  ) => {
    setAnticipos((prevAnticipos) => {
      const updatedAnticipos = [...prevAnticipos];
      updatedAnticipos[index] = {
        ...updatedAnticipos[index],
        [field]: field === "valor" ? Number(value) : value, // Convertir a número si el campo es 'valor'
      };
      return updatedAnticipos;
    });
  };

  const addConductorAnticipo = () => {
    setAnticipos((prevAnticipos: Anticipo[]) => [
      ...prevAnticipos,
      { liquidacionId: liquidacion?.id, valor: 0 }, // Añade un nuevo objeto de anticipo con valores iniciales
    ]);
  };

  const removeAnticipo = (index: number) => {
    setAnticipos((prevAnticipos) => {
      return prevAnticipos.filter((_, i) => i !== index); // Elimina el anticipo con el índice especificado
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newErrorMessages: string[] = [];

    anticipos.forEach((anticipo, index) => {
      if (anticipo.valor <= 0) {
        newErrorMessages[index] =
          `El anticipo ${index + 1} debe ser mayor a cero.`;
      }
    });

    if (newErrorMessages.length > 0) {
      setErrorMessages(newErrorMessages);

      // Limpiar los mensajes de error después de 2 segundos
      setTimeout(() => {
        setErrorMessages([]);
      }, 2000);

      return; // No continuar si hay errores
    }

    await agregarAnticipos(anticipos);
  
    setAnticipos([])
  };

  return (
    <>
      {liquidacion && (
        <div className="mt-10 space-y-10">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Button
              onPress={addConductorAnticipo}
              className="w-full"
              color="primary"
            >
              + Añadir anticipo
            </Button>
            {anticipos.map((anticipo, index) => (
              <div key={index}>
                <div className="flex justify-between items-center gap-5">
                  <Input
                    type="text"
                    label={"Valor"}
                    placeholder="$0"
                    className="w-full"
                    value={
                      anticipo.valor !== 0 ? formatCurrency(anticipo.valor) : ""
                    } // Muestra el valor solo cuando pagCliente es false
                    onChange={(e) => {
                      const inputVal = e.target.value.replace(/[^\d]/g, ""); // Quitamos caracteres no numéricos
                      const numericValue = +inputVal; // Convertimos el string limpio a número
                      handleAnticipoChange(index, "valor", numericValue);
                    }}
                  />
                  <Button
                    className="bg-red-500 text-white"
                    onPress={() => removeAnticipo(index)}
                  >
                    X
                  </Button>
                </div>
                {errorMessages[index] && (
                  <span className="text-red-500 text-sm">
                    {errorMessages[index]}
                  </span>
                )}
              </div>
            ))}

            {anticipos.length > 0 && (
              <Button type="submit" className="w-full bg-green-700 text-white">
                Registrar anticipos
              </Button>
            )}
          </form>

          <div className="space-y-4">
            <h2 className="flex-1 text-green-700 font-black text-xl lg:text-2xl">
              Anticipos realizados
            </h2>
            {Array.isArray(liquidacion?.anticipos) &&
            liquidacion.anticipos.length > 0 ? (
              <div>
                <table className="table-auto w-full text-sm mb-5">
                  <thead className="bg-red-500 text-white">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-center">Valor</th>
                      <th className="px-4 py-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liquidacion.anticipos.map((anticipo, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2 text-center">
                          {formatToCOP(anticipo.valor)}
                        </td>
                        <td className="border px-4 py-2 text-center items-center space-x-2">
                          <Tooltip content="Editar" color="primary">
                            <Button color="primary" className="h-9" isIconOnly>
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
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                />
                              </svg>
                            </Button>
                          </Tooltip>
                          <Tooltip content="Eliminar" color="danger">
                            <Button
                              onPress={()=>eliminarAnticipo(anticipo.id, state.liquidacion?.id)}
                              color="danger"
                              className="h-9"
                              isIconOnly
                            >
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
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </Button>
                          </Tooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <h2 className="flex-1 text-md">No hay anticipos realizados</h2>
            )}
          </div>
        </div>
      )}
    </>
  );
}
