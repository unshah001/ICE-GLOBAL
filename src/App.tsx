import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Gallery from "./pages/Gallery";
import GalleryDetail from "./pages/GalleryDetail";
import BrandDetail from "./pages/BrandDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Partner from "./pages/Partner";
import Sponsor from "./pages/Sponsor";
import BrandGuidelines from "./pages/BrandGuidelines";
import TestimonialsPage from "./pages/TestimonialsPage";
import Feedback from "./pages/Feedback";
import TestPage from "./pages/TestPage";
import NotFound from "./pages/NotFound";
import NewHome from "./pages/NewHome";
import AdminLogin from "./pages/AdminLogin";
import AdminGuard from "./components/auth/AdminGuard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminGallery from "./pages/AdminGallery";
import Brands from "./pages/Brands";
import AdminBrands from "./pages/AdminBrands";
import Sellers from "./pages/Sellers";
import SellerDetail from "./pages/SellerDetail";
import AdminSellers from "./pages/AdminSellers";
import Buyers from "./pages/Buyers";
import BuyerDetail from "./pages/BuyerDetail";
import AdminBuyers from "./pages/AdminBuyers";
import Founders from "./pages/Founders";
import FounderDetail from "./pages/FounderDetail";
import AdminFounders from "./pages/AdminFounders";
import Cofounders from "./pages/Cofounders";
import CofounderDetail from "./pages/CofounderDetail";
import AdminCofounders from "./pages/AdminCofounders";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import AdminTeams from "./pages/AdminTeams";
import AdminAbout from "./pages/AdminAbout";
import AdminContact from "./pages/AdminContact";
import AdminCookies from "./pages/AdminCookies";
import AdminFeedback from "./pages/AdminFeedback";
import AdminGalleryDetail from "./pages/AdminGalleryDetail";
import AdminNotFound from "./pages/AdminNotFound";
import AdminPartner from "./pages/AdminPartner";
import AdminPrivacy from "./pages/AdminPrivacy";
import AdminSponsor from "./pages/AdminSponsor";
import AdminTerms from "./pages/AdminTerms";
import AdminTestimonials from "./pages/AdminTestimonials";
import AdminForms from "./pages/AdminForms";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<NewHome />} />
          <Route path="/new-home" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/admin"
            element={
              <AdminGuard>
                <AdminDashboard />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <AdminGuard>
                <AdminGallery />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/founders"
            element={
              <AdminGuard>
                <AdminFounders />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/cofounders"
            element={
              <AdminGuard>
                <AdminCofounders />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/about"
            element={
              <AdminGuard>
                <AdminAbout />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/contact"
            element={
              <AdminGuard>
                <AdminContact />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/cookies"
            element={
              <AdminGuard>
                <AdminCookies />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/feedback"
            element={
              <AdminGuard>
                <AdminFeedback />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/gallery-detail"
            element={
              <AdminGuard>
                <AdminGalleryDetail />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/not-found"
            element={
              <AdminGuard>
                <AdminNotFound />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/partner"
            element={
              <AdminGuard>
                <AdminPartner />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/privacy"
            element={
              <AdminGuard>
                <AdminPrivacy />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/sponsor"
            element={
              <AdminGuard>
                <AdminSponsor />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/terms"
            element={
              <AdminGuard>
                <AdminTerms />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/testimonials"
            element={
              <AdminGuard>
                <AdminTestimonials />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/forms"
            element={
              <AdminGuard>
                <AdminForms />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/teams"
            element={
              <AdminGuard>
                <AdminTeams />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/buyers"
            element={
              <AdminGuard>
                <AdminBuyers />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/brands"
            element={
              <AdminGuard>
                <AdminBrands />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/sellers"
            element={
              <AdminGuard>
                <AdminSellers />
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/sponsor" element={<Sponsor />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/founders" element={<Founders />} />
          <Route path="/founders/:id" element={<FounderDetail />} />
          <Route path="/cofounders" element={<Cofounders />} />
          <Route path="/cofounders/:id" element={<CofounderDetail />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/buyers" element={<Buyers />} />
          <Route path="/buyers/:id" element={<BuyerDetail />} />
          <Route path="/sellers" element={<Sellers />} />
          <Route path="/sellers/:id" element={<SellerDetail />} />
          <Route path="/brand-guidelines" element={<BrandGuidelines />} />
          <Route path="/testimonials" element={<TestimonialsPage />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery/:id" element={<GalleryDetail />} />
          <Route path="/brands/:slug" element={<BrandDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
