import { formatCurrency, formatToCOP } from "@/helpers";
import useLiquidacion from "@/hooks/useLiquidacion";
import { Anticipo } from "@/types";
import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/button";
import { FormEvent, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";

export default function Anticipos() {
  const { state } = useLiquidacion();
  const [anticipos, setAnticipos] = useState<Anticipo[]>([]);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  const { liquidacion } = state;

  console.log(liquidacion?.anticipos?.map((anticipo) => anticipo.valor));

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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

    // Aquí puedes continuar con el procesamiento del formulario
    console.log("Anticipos válidos:", anticipos);
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
              <div>
                <div
                  key={index}
                  className="flex justify-between items-center gap-5"
                >
                  <Input
                    type="text"
                    label={`Anticipo ${index + 1}`}
                    placeholder="$0"
                    className="max-w-md"
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
                    </tr>
                  </thead>
                  <tbody>
                    {liquidacion.anticipos.map((anticipo, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{index + 1}</td>
                        <td className="border px-4 py-2 text-center">
                          {formatToCOP(anticipo.valor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
          ) : (
            <h2 className="flex-1 text-xl lg:text-2xl">
              No hay anticipos realizados
            </h2>
          )}
          </div>
        </div>
      )}
    </>
  );
}
