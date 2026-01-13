import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { useEffect } from "react";
import PageTransition from "@/components/layout/PageTransition";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Checkout from "./pages/Checkout";
import ThankYou from "./pages/ThankYou";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminLogin from "./pages/AdminLogin";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminMessages from "./pages/admin/AdminMessages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const AppRoutes = () => {
  return (
    <PageTransition>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/messages" element={<AdminMessages />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </PageTransition>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
