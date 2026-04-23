import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Hotel, LogOut, CalendarDays, Users, History, Image as ImageIcon, MessageSquare, ArrowLeft } from "lucide-react";
import { hotelConfig } from "@/config/hotel";
import { toast } from "sonner";

const ReceptionistDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name")
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

      const name = profile.full_name || session.user.email?.split("@")[0] || "Receptionist";
      setUserName(name);

      const storageKey = `has_visited_${session.user.id}`;
      const hasVisited = localStorage.getItem(storageKey);
      if (!hasVisited) {
        setIsFirstLogin(true);
        localStorage.setItem(storageKey, "true");
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

      <div className="p-8 text-center max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-10 shadow-sm">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            {isFirstLogin ? `Hello, ${userName}!` : `Welcome back, ${userName}!`}
          </h2>
          <p className="text-muted-foreground font-body text-lg leading-relaxed mb-8">
            Your dashboard is ready. You can manage bookings, guest history, gallery photos, and restaurant menu items from your specialized view.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: CalendarDays, label: "Bookings", color: "bg-blue-50 text-blue-600" },
              { icon: Users, label: "Guests", color: "bg-green-50 text-green-600" },
              { icon: History, label: "History", color: "bg-purple-50 text-purple-600" },
              { icon: ImageIcon, label: "Gallery", color: "bg-amber-50 text-amber-600" },
              { icon: MessageSquare, label: "Reviews", color: "bg-rose-50 text-rose-600" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:bg-secondary transition-colors cursor-default">
                <div className={`p-3 rounded-full ${item.color}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className="font-body text-sm font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
