import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, ConciergeBell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { hotelConfig } from "@/config/hotel";

type Role = "admin" | "receptionist";

const AdminLogin = () => {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    toast.error(error.message);
    setLoading(false);
    return;
  }

  // ✅ Check real role from database, not from what they clicked
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  setLoading(false);

  if (!profile) {
    toast.error("No account profile found. Contact your administrator.");
    await supabase.auth.signOut();
    return;
  }

  // ✅ Route based on REAL role from database
  if (profile.role === "admin") {
    toast.success("Welcome back, Admin!");
    navigate("/admin");
  } else if (profile.role === "receptionist") {
    toast.success("Welcome back, Receptionist!");
    navigate("/receptionist");
  } else {
    toast.error("Unauthorized role.");
    await supabase.auth.signOut();
  }
};

  return (
    <div className="min-h-screen bg-warm-dark flex items-center justify-center px-4 py-10">
      <div className="bg-card rounded-2xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl">
        <div className="text-center mb-6">
          <h1 className="font-heading text-2xl font-bold text-foreground">Team Portal</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">{hotelConfig.fullName}</p>
        </div>

        {/* Role toggle (Admin / Receptionist) */}
        <div className="bg-warm-dark rounded-xl p-1.5 flex gap-1 mb-6">
          <button
            type="button"
            onClick={() => setRole("admin")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm font-medium transition-all ${
              role === "admin"
                ? "bg-card text-foreground shadow"
                : "text-primary-foreground/60 hover:text-primary-foreground"
            }`}
          >
            <Shield className="w-4 h-4" />
            Admin
          </button>
          <button
            type="button"
            onClick={() => setRole("receptionist")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-body text-sm font-medium transition-all ${
              role === "receptionist"
                ? "bg-card text-foreground shadow"
                : "text-primary-foreground/60 hover:text-primary-foreground"
            }`}
          >
            <ConciergeBell className="w-4 h-4" />
            Receptionist
          </button>
        </div>

        <p className="font-body text-xs text-muted-foreground text-center mb-5">
          {role === "admin"
            ? "Full access — analytics, staff, pricing, exports, and all settings."
            : "Front-desk tools — bookings, check-in/out, gallery, and reviews."}
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in..." : `Sign in as ${role === "admin" ? "Admin" : "Receptionist"}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
