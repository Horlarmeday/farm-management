import { Link, useLocation } from "wouter";
import { 
  Home, 
  Bird, 
  Dog, 
  Fish, 
  Wrench, 
  Package, 
  DollarSign, 
  FileText,
  Bell,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Poultry", href: "/poultry", icon: Bird },
  { name: "Livestock", href: "/livestock", icon: Dog },
  { name: "Fishery", href: "/fishery", icon: Fish },
  { name: "Assets", href: "/assets", icon: Wrench },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b">
        <h2 className="text-lg font-semibold">Navigation</h2>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
              <Button
                variant={location === item.href ? "default" : "ghost"}
                className={`w-full justify-start ${
                  location === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
