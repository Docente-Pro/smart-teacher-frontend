import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSideBar";


function CustomizedSidebar({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full h-full px-4">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}

export default CustomizedSidebar;
