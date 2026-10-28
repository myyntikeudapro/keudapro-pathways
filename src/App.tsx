import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router-dom";
import { WizardProvider } from "@/contexts/WizardContext";
import { CoachPanelProvider } from "@/contexts/CoachPanelContext";
import { BookingRequestProvider } from "@/contexts/BookingRequestContext";
import { BookingRequestDialog } from "@/components/booking/BookingRequestDialog";
import { RouteWizard } from "@/components/wizard/RouteWizard";
import { CoachSelectionPanel } from "@/components/coach/CoachSelectionPanel";
import { BookingPanel } from "@/components/coach/BookingPanel";
import { MultiCoachChat } from "@/components/coach/MultiCoachChat";
import { ScrollToTop } from "@/components/shared/ScrollToTop";
import Index from "./pages/Index";
import InsightPage from "./pages/InsightPage";
import WorkPlusPage from "./pages/WorkPlusPage";
import GrowthPage from "./pages/GrowthPage";
import OperaattoriPage from "./pages/OperaattoriPage";
import KumppanitPage from "./pages/KumppanitPage";
import YhteystiedotPage from "./pages/YhteystiedotPage";
import PatevyydetPage from "./pages/PatevyydetPage";
import MuutosturvaPage from "./pages/MuutosturvaPage";
import IlmastointiM1Page from "./pages/IlmastointiM1Page";
import VerkostoPage from "./pages/VerkostoPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import HubPage from "./pages/HubPage";
import TyoelamaverkkoPage from "./pages/TyoelamaverkkoPage";
import AiTalentPage from "./pages/hub/AiTalentPage";
import AiTalentAdminPage from "./pages/hub/AiTalentAdminPage";
import AiTalentProjectsPage from "./pages/hub/AiTalentProjectsPage";
import AdminPage from "./pages/admin/AdminPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminLeadsPage from "./pages/admin/AdminLeadsPage";
import AdminMarketingPage from "./pages/admin/AdminMarketingPage";
import { PageViewTracker } from "@/components/shared/PageViewTracker";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

function PublicPanels() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin') || pathname.startsWith('/hub/ai-talent')) return null;
  return <><RouteWizard /><CoachSelectionPanel /><BookingPanel /><BookingRequestDialog /><MultiCoachChat /></>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WizardProvider>
        <CoachPanelProvider>
         <BookingRequestProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <ScrollToTop />
            <PageViewTracker />
            <PublicPanels />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/aly" element={<InsightPage />} />
              <Route path="/osaaminen" element={<PatevyydetPage />} />
              <Route path="/noste" element={<WorkPlusPage />} />
              <Route path="/muutosturva" element={<MuutosturvaPage />} />
              <Route path="/koulutukset/ilmastointipatevyys-m1-mantsala" element={<IlmastointiM1Page />} />
              <Route path="/kasvu" element={<GrowthPage />} />
              <Route path="/operaattori" element={<OperaattoriPage />} />
              <Route path="/kumppanit" element={<KumppanitPage />} />
              <Route path="/yhteystiedot" element={<YhteystiedotPage />} />
              <Route path="/verkosto" element={<VerkostoPage />} />
              <Route path="/hub" element={<HubPage />} />
              <Route path="/hub/tyoelamaverkko" element={<TyoelamaverkkoPage />} />
              <Route path="/hub/ai-talent" element={<AiTalentPage />} />
              <Route path="/hub/ai-talent/admin" element={<AiTalentAdminPage />} />
              <Route path="/hub/ai-talent/projektit" element={<AiTalentProjectsPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/sisallot" element={<AdminPage />} />
              <Route path="/admin/yhteydenotot" element={<AdminLeadsPage />} />
              <Route path="/admin/markkinointi" element={<AdminMarketingPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
         </BookingRequestProvider>
        </CoachPanelProvider>
      </WizardProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
