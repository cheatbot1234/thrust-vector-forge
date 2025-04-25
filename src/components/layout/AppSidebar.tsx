
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { RocketIcon } from '@/components/icons/RocketIcon';
import { ChartAreaIcon } from 'lucide-react';

interface AppSidebarProps {
  open: boolean;
}

const AppSidebar = ({ open }: AppSidebarProps) => {
  return (
    <Sidebar
      className={`bg-rocket-blue border-r border-rocket-blue/50 text-white transition-all duration-300 fixed md:static h-screen z-40 ${
        open ? 'translate-x-0 w-64' : '-translate-x-full md:w-0'
      }`}
    >
      <SidebarHeader className="p-4 flex items-center gap-3 border-b border-rocket-blue/50">
        <RocketIcon className="h-8 w-8 text-rocket-orange" />
        <div>
          <h2 className="font-bold">Thrust Vector Forge</h2>
          <p className="text-xs text-gray-300">v1.0.0</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="flex items-center gap-3 px-4 py-3 hover:bg-rocket-darkBlue">
              <a href="/">
                <ChartAreaIcon className="h-5 w-5" />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-rocket-blue/50 text-xs text-gray-400">
        <p>© 2025 Thrust Vector Forge</p>
        <p className="mt-1">Rocket Engine Optimization Tool</p>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
