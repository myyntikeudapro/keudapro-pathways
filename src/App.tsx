import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WizardProvider } from "@/contexts/WizardContext";
import { CoachPanelProvider } from "@/contexts/CoachPanelContext";
import { RouteWizard } from "@/components/wizard/RouteWizard";
import { CoachSelectionPanel } from "@/components/coach/CoachSelectionPanel";
import { BookingPanel } from "@/components/coach/BookingPanel";
import { MultiCoachChat } from "@/components/coach/MultiCoachChat";
import Index from "./pages/Index";
import InsightPage from "./pages/InsightPage";
import WorkPlusPage from "./pages/WorkPlusPage";
import GrowthPage from "./pages/GrowthPage";
import OperaattoriPage from "./pages/OperaattoriPage";
import KumppanitPage from "./pages/KumppanitPage";
import YhteystiedotPage from "./pages/YhteystiedotPage";
import PatevyydetPage from "./pages/PatevyydetPage";
import VerkostoPage from "./pages/VerkostoPage";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WizardProvider>
        <CoachPanelProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <RouteWizard />
            <CoachSelectionPanel />
            <BookingPanel />
            <MultiCoachChat />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/aly" element={<InsightPage />} />
              <Route path="/osaaminen" element={<PatevyydetPage />} />
              <Route path="/noste" element={<WorkPlusPage />} />
              <Route path="/kasvu" element={<GrowthPage />} />
              <Route path="/operaattori" element={<OperaattoriPage />} />
              <Route path="/kumppanit" element={<KumppanitPage />} />
              <Route path="/yhteystiedot" element={<YhteystiedotPage />} />
              <Route path="/verkosto" element={<VerkostoPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
            
          </BrowserRouter>
        </CoachPanelProvider>
      </WizardProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
