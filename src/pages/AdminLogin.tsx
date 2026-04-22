import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { hotelConfig } from "@/config/hotel";

const AdminLogin = () => {
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

    // Check real role from the database
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    setLoading(false);

    if (!profile) {
      toast.error("No account found. Contact your administrator.");
      await supabase.auth.signOut();
      return;
    }

    if (profile.role === "admin") {
      toast.success("Welcome back, Admin!");
      navigate("/admin");
    } else if (profile.role === "receptionist") {
      toast.success("Welcome back, Receptionist!");
      navigate("/receptionist");
    } else {
      toast.error("Unauthorized.");
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="min-h-screen bg-warm-dark flex items-center justify-center px-4 py-10">
      <div className="bg-card rounded-2xl p-6 sm:p-8 max-w-md w-full border border-border shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Team Portal</h1>
          <p className="font-body text-sm text-muted-foreground mt-1">{hotelConfig.fullName}</p>
          <p className="font-body text-xs text-muted-foreground mt-3">
            Sign in with your credentials. You will be directed to the correct dashboard automatically.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
