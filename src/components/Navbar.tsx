import { Link, useLocation } from "react-router-dom";
import { Home, Activity, Shield, Lightbulb, Camera, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Sessions", href: "/sessions", icon: Activity },
  { name: "Safety", href: "/safety", icon: Shield },
  { name: "Tips", href: "/tips", icon: Lightbulb },
  { name: "Gallery", href: "/gallery", icon: Camera },
  { name: "Chat", href: "/chat", icon: MessageCircle },
];

export function Navbar() {
  const location = useLocation();

  return (
    <nav className="gradient-card border-b border-border/20 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SS</span>
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Size Seeker
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/20 text-primary shadow-primary/20 shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden flex space-x-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/20 text-primary shadow-primary/20 shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}