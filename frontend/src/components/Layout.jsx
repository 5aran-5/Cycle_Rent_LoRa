import { Link, useLocation } from "react-router-dom";
import { Home, Clock, User } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div className="relative min-h-screen bg-background flex flex-col overflow-x-hidden">
      {/* Header (visible only on desktop) */}
      <header className="hidden sm:flex sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="w-full px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-primary">
            SmartBI
          </h1>
          <span className="ml-2 text-xs font-medium text-muted-foreground">
            VIT Chennai
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-[4.5rem] sm:pb-0 overflow-y-auto">
        {children}
      </main>

      {/* Fixed Bottom Nav (only on mobile) */}
      <nav
        role="navigation"
        className="fixed bottom-0 left-0 right-0 z-[9999] sm:hidden
             bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.25)]"
      >
        <div className="flex justify-between items-center px-6 py-2 h-16">
          <Link
            to="/home"
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
              isActive("/home")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Home"
          >
            <Home size={22} />
            <span className="text-xs font-medium">Home</span>
          </Link>

          <Link
            to="/activities"
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
              isActive("/activities")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Activities"
          >
            <Clock size={22} />
            <span className="text-xs font-medium">Activities</span>
          </Link>

          <Link
            to="/account"
            className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
              isActive("/account")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Account"
          >
            <User size={22} />
            <span className="text-xs font-medium">Account</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;
