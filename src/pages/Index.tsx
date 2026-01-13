import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import NewArrivals from '@/components/home/NewArrivals';
import Features from '@/components/home/Features';
import CartSidebar from '@/components/cart/CartSidebar';
import WhatsAppButton from '@/components/WhatsAppButton';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Categories />
        <NewArrivals />
      </main>
      <Footer />
      <CartSidebar />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
