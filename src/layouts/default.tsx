import useUsuario from "@/hooks/useAuth";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Link,
} from "@nextui-org/react";
import { Button } from "@nextui-org/button";
import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

export default function DefaultLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, cerrarSesion } = useUsuario();
  const navigate = useNavigate(); // Para navegar a una nueva ruta

  const menuItems = [
    {
      name: "Liquidaciones",
      href: "/liquidaciones",
    },
    {
      name: "Vehiculos",
      href: "/vehiculos",
    },
    {
      name: "Formularios",
      href: "/formularios",
    },
    {
      name: "Empresas",
      href: "/empresas",
    },
  ];

  // Función para manejar la navegación y cerrar el menú
  const handleNavigation = (href: string) => {
    navigate(href);  // Navegar a la nueva ruta
    setIsMenuOpen(false);  // Cerrar el menú
  };

  return (
    <>
      <Navbar position="sticky" isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
        <NavbarContent>
          <NavbarMenuToggle
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            className="sm:hidden"
          />
          <NavbarBrand>
            <p className="font-bold text-inherit">Transmeralda</p>
          </NavbarBrand>
        </NavbarContent>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          {menuItems.map(link => (
            <NavbarItem key={link.name}>
              <Link color="foreground" href={link.href}>
                {link.name}
              </Link>
            </NavbarItem>
          ))}
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="sm:hidden">Hola! {state.usuario?.nombre}</NavbarItem>
          <NavbarItem className="hidden sm:flex">
            <Dropdown>
              <DropdownTrigger>
                <Button color="success" variant="flat">
                  Hola! {state.usuario?.nombre}{" "}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                variant="faded"
                aria-label="Dropdown menu with icons"
              >
                <DropdownItem
                  key="logout"
                  className="text-danger"
                  color="danger"
                  onPress={cerrarSesion}
                >
                  Cerrar sesión
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        </NavbarContent>
        <NavbarMenu>
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color="foreground"
                className="w-full"
                href={item.href}
                size="lg"
                onClick={() => handleNavigation(item.href)} // Cerrar el menú al navegar
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <Button onPress={cerrarSesion} className="bg-red-500 text-white mt-5">
            Cerrar sesión
          </Button>
        </NavbarMenu>
      </Navbar>

      <main className="w-full flex-grow py-10">
        <Outlet />
      </main>
    </>
  );
}
