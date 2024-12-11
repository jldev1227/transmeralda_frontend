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
    Pagination,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "./VerticalDotsIcon";
import { SearchIcon } from "./SearchIcon";
import { columns } from "./dataTableEmpresas";
import useLiquidacion from "@/hooks/useLiquidacion";
import { Empresa } from "@/types";


type SortDirection = "ascending" | "descending"; // Asegura que los valores de direction sean compatibles

export default function TableEmpresas() {
    const { state } = useLiquidacion()
    const [filterValue, setFilterValue] = React.useState("");

    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [sortDescriptor, setSortDescriptor] = React.useState<{
        column: string;
        direction: SortDirection;
    }>({
        column: "Nombre",
        direction: "ascending",
    });

    const [page, setPage] = React.useState(1);

    const hasSearchFilter = Boolean(filterValue);

    const filteredItems = React.useMemo(() => {
        let filteredEmpresas = [...state.empresas];

        if (hasSearchFilter) {
            filteredEmpresas = filteredEmpresas.filter((empresa) => {
                const nit = empresa.NIT?.toLowerCase().replace(/\./g, "") || ""; // Maneja valores nulos
                const nombre = empresa.Nombre?.toLowerCase().replace(/\./g, "") || "";


                return (
                    nit.includes(filterValue.toLowerCase().replace(/\./g, "")) ||
                    nombre.includes(filterValue.toLowerCase().replace(/\./g, ""))
                );
            });
        }

        return filteredEmpresas;
    }, [state.empresas, filterValue]);

    const pages = Math.ceil(filteredItems.length / rowsPerPage);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const renderCell = React.useCallback(
        (empresa: Empresa, columnKey: keyof Empresa) => {
            const cellValue = empresa[columnKey];

            switch (columnKey) {
                case "acciones":
                    return (
                        <div className="relative flex justify-end items-center gap-2">
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button isIconOnly size="sm" variant="light">
                                        <VerticalDotsIcon className="text-default-300" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu>
                                    <DropdownItem>View</DropdownItem>
                                    <DropdownItem>Edit</DropdownItem>
                                    <DropdownItem>Delete</DropdownItem>
                                </DropdownMenu>
                            </Dropdown>
                        </div>
                    );
                default:
                    return cellValue.replace(/\./g, "");

            }
        }, []);

    const onNextPage = React.useCallback(() => {
        if (page < pages) {
            setPage(page + 1);
        }
    }, [page, pages]);

    const onPreviousPage = React.useCallback(() => {
        if (page > 1) {
            setPage(page - 1);
        }
    }, [page]);

    const onRowsPerPageChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    }, []);

    const onSearchChange = React.useCallback((value: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const onClear = React.useCallback(() => {
        setFilterValue("")
        setPage(1)
    }, [])

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <Input
                        isClearable
                        className="w-full sm:max-w-[44%]"
                        placeholder="Busca por nombre o NIT..."
                        startContent={<SearchIcon />}
                        value={filterValue}
                        onClear={() => onClear()}
                        onValueChange={onSearchChange}
                    />
                    <Button color="primary">
                        Añadir empresa +
                    </Button>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">Total {state.empresas.length} empresas</span>
                    <label className="flex items-center text-default-400 text-small">
                        Filas por página:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="10">10</option>
                            <option value="25">30</option>
                            <option value="50">50</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        onRowsPerPageChange,
        state.empresas.length,
        onSearchChange,
        hasSearchFilter,
    ]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                />
                <div className="hidden sm:flex w-[30%] justify-end gap-2">
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onPreviousPage}>
                        Previous
                    </Button>
                    <Button isDisabled={pages === 1} size="sm" variant="flat" onPress={onNextPage}>
                        Next
                    </Button>
                </div>
            </div>
        );
    }, [items.length, page, pages, hasSearchFilter]);

    return (
        <Table
            aria-label="Tabla de empresas asociadas"
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            isStriped
            topContent={topContent}
            sortDescriptor={sortDescriptor}
            topContentPlacement="outside"
            onSortChange={(descriptor) => {
                if (descriptor.column) {
                    setSortDescriptor({
                        column: descriptor.column as string,
                        direction: descriptor.direction || "ascending", // Proporciona un valor por defecto para direction
                    });
                }
            }}
        >
            <TableHeader columns={columns}>
                {(column) => (
                    <TableColumn
                        key={column.uid}
                        align={column.uid === "acciones" ? "center" : "start"}
                        allowsSorting={column.sortable}
                        className="uppercase bg-green-700 text-white"
                    >
                        {column.name}
                    </TableColumn>
                )}
            </TableHeader>
            <TableBody emptyContent={"Empresa no encontrada"} items={items}>
                {(item) => (
                    <TableRow key={item.id}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>

        </Table>
    );
}
