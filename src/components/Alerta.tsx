import { AlertState } from "@/types";

type AlertaProps = {
  alerta: AlertState;
}

export default function Alerta({alerta} : AlertaProps) {
    return (
      <div className={`${alerta.success ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'} bg-gradient-to-br text-center p-3 rounded-xl text-white font-bold text-sm my-2`}>{alerta.message}</div>
    )
  }