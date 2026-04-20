import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { hotelConfig } from "@/config/hotel";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sending, setSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }
    setSending(true);
    // Open user's email client with prefilled message to reception
    const subject = encodeURIComponent(`Inquiry from ${form.name}`);
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name}\n${form.email}`);
    window.location.href = `mailto:${hotelConfig.email}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSending(false);
      toast.success("Opening your email app to send the message…");
      setForm({ name: "", email: "", message: "" });
    }, 600);
  };

  return (
    <section id="contact" className="py-20 bg-warm-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-gold font-body text-sm tracking-[0.2em] uppercase mb-2">Get in Touch</p>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground">Contact Us</h2>
          <p className="font-body text-muted-foreground mt-3 max-w-2xl mx-auto">
            Have a question or special request? Our team is here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 max-w-6xl mx-auto">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground">Call Us</h4>
                  <a href={hotelConfig.phoneHref} className="font-body text-sm text-muted-foreground hover:text-gold">
                    {hotelConfig.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground">Email Us</h4>
                  <a href={`mailto:${hotelConfig.email}`} className="font-body text-sm text-muted-foreground hover:text-gold break-all">
                    {hotelConfig.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-foreground">Visit Us</h4>
                  <p className="font-body text-sm text-muted-foreground">{hotelConfig.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="lg:col-span-3 bg-card rounded-xl p-6 md:p-8 border border-border space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="Your name" />
              </div>
              <div>
                <label className="block font-body text-sm font-medium text-foreground mb-1.5">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required
                  className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  placeholder="you@email.com" />
              </div>
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-foreground mb-1.5">Message *</label>
              <textarea name="message" value={form.message} onChange={handleChange} rows={5} required
                className="w-full px-4 py-2.5 rounded-md border border-input bg-background font-body text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                placeholder="How can we help you?" />
            </div>
            <button type="submit" disabled={sending}
              className="w-full gold-gradient px-6 py-3 rounded-md font-body font-medium text-primary-foreground flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-60">
              <Send className="w-4 h-4" />
              {sending ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
