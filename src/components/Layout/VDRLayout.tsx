import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { VDRSidebar } from './VDRSidebar';
import { VDRHeader } from './VDRHeader';
import { cn } from '@/lib/utils';

interface VDRLayoutProps {
  children?: React.ReactNode;
}

export const VDRLayout = ({ children }: VDRLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <VDRHeader 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        sidebarCollapsed={sidebarCollapsed}
      />
      
      <div className="flex h-[calc(100vh-4rem)]">
        <VDRSidebar collapsed={sidebarCollapsed} />
        
        <main className={cn(
          "flex-1 overflow-auto transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}>
          <div className="p-6">
            {children || <Outlet />}
          </div>
        </main>
      </div>
    </div>
  );
};