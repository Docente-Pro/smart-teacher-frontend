import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";

function ToggleDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Cargar el estado inicial del modo oscuro desde el almacenamiento local
    const darkMode = localStorage.getItem("darkMode") === "true";
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  return (
    <div className="flex items-center space-x-2 bg-transparent justify-end p-4 ">
      <Sun className="text-yellow-500" />
      <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
      <Moon className="text-yellow-500" />
    </div>
  );
}

export default ToggleDarkMode;
