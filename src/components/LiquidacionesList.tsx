import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@nextui-org/table'
import { Pagination } from '@nextui-org/react';
import { useMemo, useState } from 'react';

export default function LiquidacionesList() {
    const [page, setPage] = useState(1);
    const rowsPerPage = 4;

    const [liquidaciones, setLiquidaciones] = useState([])
  
    const pages = Math.ceil(liquidaciones.length / rowsPerPage);
  
    const items = useMemo(() => {
      const start = (page - 1) * rowsPerPage;
      const end = start + rowsPerPage;
  
      return liquidaciones.slice(start, end);
    }, [page, liquidaciones]);
  
    return (
      <Table
        aria-label="Example table with client side pagination"
        bottomContent={
          <div className="flex w-full justify-center">
            <Pagination
              isCompact
              showControls
              showShadow
              color="secondary"
              page={page}
              total={pages}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        classNames={{
          wrapper: "min-h-[222px]",
        }}
      >
        <TableHeader>
          <TableColumn key="name">#</TableColumn>
          <TableColumn key="role">|</TableColumn>
          <TableColumn key="status">STATUS</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(liquidacion : any) => (
            <TableRow key={liquidacion.name}>
              {(columnKey : number) => <TableCell>{getKeyValue(liquidacion, columnKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
}
  