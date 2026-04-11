import heroImg from "@/assets/hotel-hero.jpg";

const HeroSection = () => {
  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      <img
        src={heroImg}
        alt="Silver Hotel Kigali exterior at golden hour"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="font-body text-gold-light tracking-[0.3em] uppercase text-sm mb-4 animate-fade-in">
          Welcome to
        </p>
        <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          Silver Hotel
        </h1>
        <p className="font-heading text-xl md:text-2xl text-gold-light italic mb-2 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          Kigali, Rwanda
        </p>
        <p className="font-body text-primary-foreground/80 text-base md:text-lg max-w-xl mx-auto mt-4 mb-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
          Experience luxury and comfort in the heart of Africa's most vibrant city. Your perfect stay awaits.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
          <a
            href="#rooms"
            className="gold-gradient px-8 py-3.5 rounded-md font-body font-medium text-primary-foreground tracking-wide hover:opacity-90 transition-opacity"
          >
            View Our Rooms
          </a>
          <a
            href="#booking"
            className="border border-gold-light px-8 py-3.5 rounded-md font-body font-medium text-primary-foreground tracking-wide hover:bg-primary-foreground/10 transition-colors"
          >
            Book Now
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
