import { useNavigate } from "react-router-dom";
import { ShieldCheck, UserCircle, Hotel, ArrowLeft } from "lucide-react";
import { hotelConfig } from "@/config/hotel";

const LoginSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-warm-dark flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold/5 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* Logo & Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 text-gold mb-4 border border-gold/20">
            <Hotel className="w-8 h-8" />
          </div>
          <h1 className="font-heading text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
            Team Portal
          </h1>
          <p className="font-body text-gold-light tracking-[0.2em] uppercase text-xs mb-6">
            {hotelConfig.fullName}
          </p>
          <div className="h-1 w-20 bg-gold mx-auto rounded-full" />
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* Admin Card */}
          <button
            onClick={() => navigate("/admin/login")}
            className="group relative bg-card/40 backdrop-blur-sm border border-gold/20 p-10 rounded-3xl text-left transition-all duration-500 hover:bg-gold/10 hover:border-gold/50 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(197,165,114,0.15)]"
          >
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white mb-4">Administrator</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-8">
                Access full system controls, manage staff accounts, view analytics, and configure hotel settings.
              </p>
              <div className="mt-auto flex items-center text-gold font-body font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                Admin Sign In <span className="ml-2">→</span>
              </div>
            </div>
            {/* Corner Accent */}
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-gold/0 group-hover:border-gold/40 transition-colors duration-500 rounded-tr-lg" />
          </button>

          {/* Receptionist Card */}
          <button
            onClick={() => navigate("/receptionist/login")}
            className="group relative bg-card/40 backdrop-blur-sm border border-white/10 p-10 rounded-3xl text-left transition-all duration-500 hover:bg-white/5 hover:border-white/30 hover:translate-y-[-8px] hover:shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
          >
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                <UserCircle className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-white mb-4">Receptionist</h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-8">
                Manage room bookings, handle guest arrivals, update the restaurant menu, and respond to reviews.
              </p>
              <div className="mt-auto flex items-center text-white/80 font-body font-semibold text-sm group-hover:translate-x-2 transition-transform duration-300">
                Staff Sign In <span className="ml-2">→</span>
              </div>
            </div>
          </button>
        </div>

        {/* Footer Link */}
        <button
          onClick={() => navigate("/")}
          className="mt-12 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors font-body text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Guest Website
        </button>
      </div>
    </div>
  );
};

export default LoginSelection;
