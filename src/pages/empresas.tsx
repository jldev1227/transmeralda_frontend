import TableEmpresas from "@/components/TableEmpresas";

export default function Empresas() {
  return (
    <div className="px-10 space-y-16">
      <h1 className="text-green-700 font-black text-2xl lg:text-4xl text-center">
        Empresas asociadas
      </h1>
      <TableEmpresas/>
    </div>
  )
}
