import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User } from "lucide-react";
import { logo_image } from "@/utils/images/index.images";
import ToggleDarkMode from "./ToggleDarkMode";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation } from "react-router";
import { useAuthStore } from "@/store/auth.store";

export default function Header() {
  const { logout } = useAuth0();

  const [user, _setUser] = useState({
    name: "Usuario Ejemplo",
    email: "usuario@ejemplo.com",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  });

  //verificar si estamos en el cuestionario inicial, si es así, no mostrar el apartado del logo ni perfil, solo el toggle dark mode
  const { pathname } = useLocation();
  const isInitialQuestionnaire = pathname.includes("cuestionario-inicial");

  const handleLogout = () => {
    localStorage.clear();
    useAuthStore.getState().clearAuth();
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <header className="shadow-sm dark:shadow-md bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to={isInitialQuestionnaire ? "#" : "/"}>
          <div className="flex items-center gap-4">
            <img src={logo_image} className="w-14" alt="logo-image" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Docente Pro</h1>
          </div>
        </Link>

        <section className="flex items-center gap-4">
          <ToggleDarkMode />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {!isInitialQuestionnaire && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </section>
      </div>
    </header>
  );
}
