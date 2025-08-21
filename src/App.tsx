import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VDRLayout } from "./components/Layout/VDRLayout";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import QA from "./pages/QA";
import Bids from "./pages/Bids";
import Users from "./pages/Users";
import Timeline from "./pages/Timeline";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<VDRLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/:folder" element={<Documents />} />
            <Route path="qa" element={<QA />} />
            <Route path="bids" element={<Bids />} />
            <Route path="users" element={<Users />} />
            <Route path="timeline" element={<Timeline />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
