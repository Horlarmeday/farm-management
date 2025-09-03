import { useState, useEffect, createContext, useContext } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/Dashboard";
import Poultry from "@/pages/Poultry";
import Livestock from "@/pages/Livestock";
import Fishery from "@/pages/Fishery";
import Assets from "@/pages/Assets";
import Inventory from "@/pages/Inventory";
import Finance from "@/pages/Finance";
import Reports from "@/pages/Reports";
import HR from "@/pages/HR";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/layout/Navbar";

// Frontend-only auth context
const AuthContext = createContext<{
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}>({
  isAuthenticated: false,
  login: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedAuth = localStorage.getItem('farmAuth');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    // Simple frontend validation - in real app this would call an API
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('farmAuth', 'true');
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('farmAuth');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <div className="min-h-screen bg-background">
        {isAuthenticated && <Navbar />}
        <div className={isAuthenticated ? "pt-16" : ""}>
          <Switch>
            {!isAuthenticated ? (
              <Route path="/" component={Login} />
            ) : (
              <>
                <Route path="/" component={Dashboard} />
                <Route path="/poultry" component={Poultry} />
                <Route path="/livestock" component={Livestock} />
                <Route path="/fishery" component={Fishery} />
                <Route path="/assets" component={Assets} />
                <Route path="/inventory" component={Inventory} />
                <Route path="/finance" component={Finance} />
                <Route path="/hr" component={HR} />
                <Route path="/reports" component={Reports} />
                <Route component={NotFound} />
              </>
            )}
          </Switch>
        </div>
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;