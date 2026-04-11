import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RoomsSection from "@/components/RoomsSection";
import AmenitiesSection from "@/components/AmenitiesSection";
import BookingSection from "@/components/BookingSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <RoomsSection />
      <AmenitiesSection />
      <BookingSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
