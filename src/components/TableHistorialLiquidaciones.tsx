import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Input,
  Button,
  DropdownTrigger,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Chip,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "./VerticalDotsIcon";
import { SearchIcon } from "./SearchIcon";
import { ChevronDownIcon } from "./ChevronDownIcon";
import { columns, statusOptions } from "./dataTableLiquidaciones";
import { capitalize } from "./utils";
import useLiquidacion from "@/hooks/useLiquidacion";
import { formatDate, formatToCOP } from "@/helpers";
import { Liquidacion } from "@/types";
import handleGeneratePDF from "./pdfMaker";

// Define un tipo que coincida con los valores permitidos
const statusColorMap: Record<
  string,
  "warning" | "success" | "default" | "primary" | "secondary" | "danger"
> = {
  Pendiente: "warning",
  Liquidado: "success",
  // Otros posibles estados mapeados a los colores permitidos
};

const INITIAL_VISIBLE_COLUMNS = [
  "periodoStart",
  "conductor",
  "salarioDevengado",
  "auxilioTransporte",
  "totalBonificaciones",
  "totalRecargos",
  "totalPernotes",
  "ajusteSalarial",
  "salud",
  "pension",
  "totalAnticipos",
  "sueldoTotal",
  "estado",
  "acciones",
];

type SortDirection = "ascending" | "descending"; // Asegura que los valores de direction sean compatibles

export default function App() {
  const { state, dispatch } = useLiquidacion();
  const [filterValue, setFilterValue] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<Set<string>>(
    new Set()
  );

  const [visibleColumns, setVisibleColumns] = React.useState(
    new Set(INITIAL_VISIBLE_COLUMNS)
  );

  const [statusFilter, setStatusFilter] = React.useState<Set<string>>(
    new Set(statusOptions.map((status) => status.uid))
  );

  const [sortDescriptor, setSortDescriptor] = React.useState<{
    column: string;
    direction: SortDirection;
  }>({
    column: "age",
    direction: "ascending",
  });

  const hasSearchFilter = Boolean(filterValue);

  const headerColumns = React.useMemo(() => {
    // Si visibleColumns contiene todas las columnas o está vacío, devolvemos todas las columnas
    if (visibleColumns.size === 0 || visibleColumns.has("all")) return columns;

    // Filtramos las columnas basándonos en los uids presentes en visibleColumns
    return columns.filter((column) => visibleColumns.has(column.uid));
  }, [visibleColumns, columns]);

  const filteredItems = React.useMemo(() => {
    let filteredLiquidaciones = [...state.liquidaciones];

    if (hasSearchFilter) {
      filteredLiquidaciones = filteredLiquidaciones.filter(
        (liquidacion) =>
          liquidacion.conductor.nombre
            .toLowerCase()
            .includes(filterValue.toLowerCase()) ||
          liquidacion.conductor.apellido
            .toLowerCase()
            .includes(filterValue.toLowerCase())
      );
    }

    if (statusFilter.size > 0 && statusFilter.size !== statusOptions.length) {
      // statusFilter ahora es un Set, por lo que usamos has
      filteredLiquidaciones = filteredLiquidaciones.filter((liquidacion) =>
        statusFilter.has(liquidacion?.estado)
      );
    }

    return filteredLiquidaciones;
  }, [
    state.liquidaciones,
    filterValue,
    statusFilter,
    hasSearchFilter,
    statusOptions.length,
  ]);

  const sortedItems = React.useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const first = a[sortDescriptor.column];
      const second = b[sortDescriptor.column];
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, filteredItems]);

  const renderCell = React.useCallback(
    (liquidacion: Liquidacion, columnKey: keyof Liquidacion) => {
      const cellValue = liquidacion[columnKey];

      switch (columnKey) {
        case "periodoStart":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatDate(liquidacion?.periodoStart)}
              </p>
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatDate(liquidacion?.periodoEnd)}
              </p>
            </div>
          );

        case "conductor":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {`${liquidacion?.conductor?.nombre} ${liquidacion?.conductor?.apellido}`}
              </p>
            </div>
          );
        case "salarioDevengado":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.salarioDevengado)}
              </p>
            </div>
          );
        case "auxilioTransporte":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.auxilioTransporte)}
              </p>
            </div>
          );
        case "totalBonificaciones":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.totalBonificaciones)}
              </p>
            </div>
          );
        case "totalRecargos":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.totalRecargos)}
              </p>
            </div>
          );
        case "totalPernotes":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.totalPernotes)}
              </p>
            </div>
          );
        case "ajusteSalarial":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.ajusteSalarial)}
              </p>
            </div>
          );
        case "salud":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.salud)}
              </p>
            </div>
          );
        case "pension":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.pension)}
              </p>
            </div>
          );
        case "totalAnticipos":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.totalAnticipos)}
              </p>
            </div>
          );
        case "sueldoTotal":
          return (
            <div className="flex flex-col">
              <p className="text-bold text-tiny capitalize text-default-400">
                {formatToCOP(liquidacion?.sueldoTotal)}
              </p>
            </div>
          );
        case "estado":
          return (
            <Chip
              className="capitalize"
              color={statusColorMap[liquidacion?.estado]}
              size="sm"
              variant="flat"
            >
              {cellValue}
            </Chip>
          );
        case "acciones":
          return (
            <div className="relative flex justify-end items-center gap-2">
              <Dropdown>
                <DropdownTrigger>
                  <Button isIconOnly size="sm" variant="light">
                    <VerticalDotsIcon
                      size={24}
                      width={24}
                      height={24}
                      className="text-default-300"
                    />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu>
                  <DropdownItem
                    className="flex gap-2 items-center"
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    }
                    onPress={() => {
                      dispatch({
                        type: "SET_LIQUIDACION",
                        payload: {
                          allowEdit: false,
                          liquidacion: liquidacion,
                        },
                      });
                    }}
                  >
                    Ver
                  </DropdownItem>
                  <DropdownItem
                    className="flex gap-2 items-center"
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                        />
                      </svg>
                    }
                    onPress={() => handleGeneratePDF(liquidacion)}
                  >
                    Desprendible
                  </DropdownItem>
                  <DropdownItem
                    className="flex gap-2 items-center"
                    startContent={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    }
                    onPress={() =>
                      dispatch({
                        type: "SET_LIQUIDACION",
                        payload: {
                          allowEdit: true,
                          liquidacion: liquidacion,
                        },
                      })
                    }
                  >
                    Editar
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        default:
          return cellValue;
      }
    },
    []
  );

  const onSearchChange = React.useCallback((value: string) => {
    if (value) {
      setFilterValue(value);
    } else {
      setFilterValue("");
    }
  }, []);

  const onClear = React.useCallback(() => {
    setFilterValue("");
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex justify-between gap-3 items-end">
          <Input
            isClearable
            className="w-full sm:max-w-[24%]"
            placeholder="Buscar por conductor..."
            startContent={<SearchIcon />}
            value={filterValue}
            onClear={() => onClear()}
            onValueChange={onSearchChange}
          />
          <div className="flex gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Estados
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  setStatusFilter(new Set(Array.from(keys).map(String))); // Actualiza el estado con las nuevas selecciones
                }}
              >
                {statusOptions.map((status) => (
                  <DropdownItem key={status.uid} className="capitalize">
                    {capitalize(status.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex">
                <Button
                  endContent={<ChevronDownIcon className="text-small" />}
                  variant="flat"
                >
                  Columnas
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Table Columns"
                closeOnSelect={false}
                selectedKeys={visibleColumns}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  // Convierte SharedSelection a Set<string>
                  const newVisibleColumns = new Set(
                    Array.from(keys as Set<string>)
                  );
                  setVisibleColumns(newVisibleColumns);
                }}
              >
                {columns.map((column) => (
                  <DropdownItem key={column.uid} className="capitalize">
                    {capitalize(column.name)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {state.liquidaciones.length} liquidaciones
          </span>
        </div>
      </div>
    );
  }, [
    filterValue,
    statusFilter,
    visibleColumns,
    state.liquidaciones.length,
    onSearchChange,
    hasSearchFilter,
  ]);

  return (
    <Table
      aria-label="Example table with custom cells, pagination and sorting"
      isHeaderSticky
      isStriped
      selectedKeys={selectedKeys}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="outside"
      onSelectionChange={(keys) => {
        // Asegúrate de que keys es un Set<string>
        setSelectedKeys(new Set(keys as Set<string>));
      }}
      onSortChange={(descriptor) => {
        if (descriptor.column) {
          setSortDescriptor({
            column: descriptor.column as string,
            direction: descriptor.direction || "ascending", // Proporciona un valor por defecto para direction
          });
        }
      }}
    >
      <TableHeader columns={headerColumns}>
        {(column) => (
          <TableColumn
            className="bg-green-700 text-white uppercase"
            key={column.uid}
            align={column.uid === "actions" ? "center" : "start"}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={"No hay liquidaciones realizadas"}
        items={sortedItems}
      >
        {(item) => (
          <TableRow key={item.id}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
