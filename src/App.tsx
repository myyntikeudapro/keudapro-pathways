import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
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
import TyohonvalmennusPksPage from "./pages/TyohonvalmennusPksPage";
import GrowthPage from "./pages/GrowthPage";
import OperaattoriPage from "./pages/OperaattoriPage";
import KumppanitPage from "./pages/KumppanitPage";
import YhteystiedotPage from "./pages/YhteystiedotPage";
import PatevyydetPage from "./pages/PatevyydetPage";
import MuutosturvaPage from "./pages/MuutosturvaPage";
import IlmastointiM1Page from "./pages/IlmastointiM1Page";
import AseptiikkaPage from "./pages/AseptiikkaPage";
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
import AdminProductionPage from "./pages/admin/AdminProductionPage";
import AdminCustomersPage from "./pages/admin/AdminCustomersPage";
import AdminCatalogPage from "./pages/admin/AdminCatalogPage";
import CatalogProductPage from "./pages/CatalogProductPage";
import { PageViewTracker } from "@/components/shared/PageViewTracker";
import { AuthProvider } from "./hooks/useAuth";
import NotFound from "./pages/NotFound";


const queryClient = new QueryClient();

/** Keeps the recovery token (URL hash) when forwarding to the login page's reset mode. */
function PasswordResetRedirect() {
  const { hash } = useLocation();
  return <Navigate to={`/admin/login?palautus=1${hash}`} replace />;
}

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
              <Route path="/tyohonvalmennus-pks" element={<TyohonvalmennusPksPage />} />
              <Route path="/tyohonvalmennus-pks/en" element={<TyohonvalmennusPksPage />} />
              <Route path="/tyohonvalmennus-pks/sv" element={<TyohonvalmennusPksPage />} />
              <Route path="/muutosturva" element={<MuutosturvaPage />} />
              <Route path="/koulutukset/ilmastointipatevyys-m1-mantsala" element={<IlmastointiM1Page />} />
              <Route path="/koulutukset/aseptiikka-hoitotyossa" element={<AseptiikkaPage />} />
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
              <Route path="/admin/forgot-password" element={<Navigate to="/admin/login?unohtunut=1" replace />} />
              <Route path="/admin/reset-password" element={<PasswordResetRedirect />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/sisallot" element={<AdminPage />} />
              <Route path="/admin/yhteydenotot" element={<AdminLeadsPage />} />
              <Route path="/admin/markkinointi" element={<AdminMarketingPage />} />
              <Route path="/admin/tuotanto" element={<AdminProductionPage />} />
              <Route path="/admin/asiakkaat" element={<AdminCustomersPage />} />
              <Route path="/admin/asiakkaat/henkilot/:contactId" element={<AdminCustomersPage />} />
              <Route path="/admin/asiakkaat/:organizationId" element={<AdminCustomersPage />} />
              <Route path="/admin/kurssiluettelo" element={<AdminCatalogPage />} />
              <Route path="/kurssit/:slug" element={<CatalogProductPage />} />
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
