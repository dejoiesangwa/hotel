import Navbar from "@/components/Navbar";
import RoomsSection from "@/components/RoomsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import roomsHero from "@/assets/rooms-hero.jpg";

const RoomsPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={roomsHero}
          alt="Luxury Rooms"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-3">Accommodation</p>
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">Rooms & Suites</h1>
          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto">
            Experience unparalleled luxury and comfort in our meticulously designed rooms, where every detail is crafted for your perfect stay.
          </p>
        </div>
      </div>
      <RoomsSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default RoomsPage;
