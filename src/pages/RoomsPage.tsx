import Navbar from "@/components/Navbar";
import RoomsSection from "@/components/RoomsSection";
import Footer from "@/components/Footer";

const RoomsPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="https://github.com/user-attachments/assets/c99ec32e-e2de-4444-aed6-d105a8358197"
          alt="Luxury Rooms"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-white mb-4">Our Accommodations</h1>
          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto">
            Experience unparalleled luxury and comfort in our meticulously designed rooms, where every detail is crafted for your perfect stay.
          </p>
        </div>
      </div>
      <RoomsSection />
      <Footer />
    </div>
  );
};

export default RoomsPage;
