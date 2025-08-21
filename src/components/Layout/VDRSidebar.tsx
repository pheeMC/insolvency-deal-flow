import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FolderOpen,
  MessageCircle,
  Gavel,
  Users,
  Settings,
  FileText,
  BarChart3,
  Clock,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

interface VDRSidebarProps {
  collapsed: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: Home,
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FolderOpen,
    children: [
      { title: '00_Admin', href: '/documents/admin', icon: Shield },
      { title: '01_Corporate', href: '/documents/corporate', icon: FileText },
      { title: '02_Financials', href: '/documents/financials', icon: BarChart3 },
      { title: '90_InsO', href: '/documents/insolvency', icon: Gavel },
    ],
  },
  {
    title: 'Q&A Center',
    href: '/qa',
    icon: MessageCircle,
    badge: 12,
  },
  {
    title: 'Bids',
    href: '/bids',
    icon: Gavel,
    badge: 'New',
  },
  {
    title: 'Users & Roles',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Timeline',
    href: '/timeline',
    icon: Clock,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const VDRSidebar = ({ collapsed }: VDRSidebarProps) => {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['/documents']);

  const toggleExpanded = (href: string) => {
    setExpandedItems(prev =>
      prev.includes(href)
        ? prev.filter(item => item !== href)
        : [...prev, href]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.href);
    const active = isActive(item.href);

    return (
      <div key={item.href} className="space-y-1">
        {hasChildren ? (
          <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(item.href)}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-between h-10 px-3 font-normal",
                  active && "bg-primary/10 text-primary font-medium",
                  collapsed && "justify-center px-2",
                  level > 0 && "ml-4 w-[calc(100%-1rem)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", collapsed && "h-5 w-5")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                {!collapsed && (
                  isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                )}
              </Button>
            </CollapsibleTrigger>
            {!collapsed && (
              <CollapsibleContent className="space-y-1">
                {item.children?.map(child => renderNavItem(child, level + 1))}
              </CollapsibleContent>
            )}
          </Collapsible>
        ) : (
          <NavLink to={item.href}>
            {({ isActive }) => (
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-10 px-3 font-normal",
                  isActive && "bg-primary/10 text-primary font-medium",
                  collapsed && "justify-center px-2",
                  level > 0 && "ml-4 w-[calc(100%-1rem)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", collapsed && "h-5 w-5")} />
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </Button>
            )}
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <div className={cn(
      "vdr-sidebar fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-300 z-40",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex flex-col h-full p-3">
        <div className="flex-1 space-y-2">
          {navItems.map(item => renderNavItem(item))}
        </div>
        
        {!collapsed && (
          <div className="border-t pt-3 mt-3">
            <div className="text-xs text-muted-foreground px-3 mb-2">
              Deal Status
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>Phase</span>
                <Badge variant="outline">NBO</Badge>
              </div>
              <div className="flex items-center justify-between px-3 py-2 text-sm">
                <span>Deadline</span>
                <span className="text-xs text-muted-foreground">14 days</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};