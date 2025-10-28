import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Bike, Users, MapPin, ScrollText, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Bicycles', url: '/bicycles', icon: Bike },
  { title: 'Users', url: '/users', icon: Users },
  { title: 'Live Tracking', url: '/tracking', icon: MapPin },
  { title: 'Rental Logs', url: '/logs', icon: ScrollText },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Bike className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-sidebar-foreground">BikeShare</h2>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}