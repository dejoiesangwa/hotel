import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-warm-dark flex items-center justify-center px-4">
      <div className="bg-card rounded-xl p-8 max-w-md w-full border border-border">
        <h1 className="font-heading text-2xl font-bold text-foreground text-center mb-1">Reception Login</h1>
        <p className="font-body text-sm text-muted-foreground text-center mb-6">Silver Hotel Kigali — Staff Dashboard</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>
          <div>
            <label className="block font-body text-sm font-medium text-foreground mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60">
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
