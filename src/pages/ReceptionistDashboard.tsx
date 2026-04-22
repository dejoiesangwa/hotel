import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Hotel, LogOut, CalendarDays, Users, History, Image as ImageIcon, MessageSquare, ArrowLeft } from "lucide-react";
import { hotelConfig } from "@/config/hotel";
import { toast } from "sonner";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile) {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      // ✅ If admin tries to go to /receptionist, send them back to /admin
      if (profile.role === "admin") {
        navigate("/admin");
        return;
      }

      // ✅ Only receptionists get through
      if (profile.role !== "receptionist") {
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }

      setLoading(false);
    };
    check();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-warm-dark border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-5 h-5 text-gold" />
          <span className="font-heading text-lg text-primary-foreground font-semibold">
            {hotelConfig.name} — Reception
          </span>
          <span className="ml-2 text-[10px] uppercase tracking-wider font-body font-semibold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
            receptionist
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-primary-foreground/60 hover:text-primary-foreground text-sm font-body flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </a>
          <button onClick={handleLogout} className="text-primary-foreground/60 hover:text-primary-foreground text-sm font-body flex items-center gap-1">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </header>

      <div className="p-8 text-center">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Welcome, Receptionist!</h2>
        <p className="text-muted-foreground font-body">Your dashboard is ready. Bookings, guests, gallery and reviews will appear here.</p>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
