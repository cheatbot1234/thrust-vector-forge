
import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-rocket-darkBlue text-white relative">
        <AppSidebar open={sidebarOpen} />
        
        <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : 'ml-0'}`}>
          <header className="bg-rocket-blue p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-white hover:bg-rocket-blue/50 mr-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Thrust Vector Forge</h1>
            </div>
          </header>
          
          <main className="flex-1 bg-gradient-to-br from-rocket-blue to-rocket-darkBlue">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
