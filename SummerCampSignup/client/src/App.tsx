import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import Registration from "@/pages/registration";
import CheckRegistration from "@/pages/check-registration";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import DatabaseAdmin from "@/pages/database-admin";
import NotFound from "@/pages/not-found";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <div className="min-h-screen bg-temple-cream">
      <Navigation />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/registration" component={Registration} />
        <Route path="/check-registration" component={CheckRegistration} />
        <Route path="/admin" component={Admin} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/database-admin" component={DatabaseAdmin} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
