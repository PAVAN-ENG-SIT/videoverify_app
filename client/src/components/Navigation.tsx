import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, Upload, Database } from "lucide-react";

export function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Shield },
    { path: "/verify", label: "Verify", icon: Upload },
    { path: "/blockchain", label: "Blockchain", icon: Database },
    { path: "/admin", label: "Admin", icon: Shield },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-blockchain-black/90 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 hover-elevate rounded-lg px-3 py-2 cursor-pointer"
            data-testid="link-home"
          >
            <Shield className="w-6 h-6 text-blockchain-green" />
            <span className="font-heading font-bold text-xl text-white">
              BlockchainVerify
            </span>
          </div>

          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;

              return (
                <Button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  variant={isActive ? "default" : "ghost"}
                  className={isActive ? "bg-blockchain-blue hover:bg-blockchain-blue/90" : ""}
                  data-testid={`button-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
