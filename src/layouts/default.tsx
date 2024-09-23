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
import { Button } from '@nextui-org/button'
import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function DefaultLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { state } = useUsuario();

  const menuItems = [
    {
      name: "Liquidaciones",
      href: "/liquidaciones",
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
          <NavbarItem>
            <Link color="foreground" href="/liquidaciones">
              Liquidaciones
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <NavbarItem className="hidden lg:flex">
            <Link href="#">Hola! {state.usuario?.nombre}</Link>
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
          <Button className="bg-red-500 text-white mt-auto">
            Cerrar sesión
          </Button>
        </NavbarMenu>
      </Navbar>

      <main className="container mx-auto px-6 flex-grow pt-16">
        <Outlet />
      </main>
    </div>
  );
}
