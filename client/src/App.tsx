import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Page Imports
import Dashboard from "./pages/Dashboard";
import VoucherFormPage from "./pages/VoucherFormPage";
import PrintView from "./pages/PrintView";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vouchers/new" component={VoucherFormPage} />
      <Route path="/vouchers/:id/edit" component={VoucherFormPage} />
      <Route path="/vouchers/:id" component={PrintView} />
      <Route component={NotFound} />
    </Switch>
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
