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
import { Outlet } from "react-router-dom";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";

export default function DefaultLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state, cerrarSesion } = useUsuario();

  const menuItems = [
    {
      name: "Liquidaciones",
      href: "/liquidaciones",
    },
    {
      name: "Empresas",
      href: "/empresas",
    },
  ];

  return (
    <div className="relative flex flex-col h-screen">
      <Navbar onMenuOpenChange={setIsMenuOpen}>
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
        <NavbarMenu className="pb-8">
          {menuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color="foreground"
                className="w-full"
                href={item.href}
                size="lg"
              >
                {item.name}
              </Link>
            </NavbarMenuItem>
          ))}
          <Button onPress={cerrarSesion} className="bg-red-500 text-white mt-auto">
            Cerrar sesión
          </Button>
        </NavbarMenu>
      </Navbar>

      <main className="w-full mx-auto px-6 md:px-20 flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
