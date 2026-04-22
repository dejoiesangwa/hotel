import { useEffect, useState, useMemo } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LogOut, Hotel, BedDouble, CalendarDays, Settings, Plus, Pencil, Trash2,
  Check, X, Users, ArrowLeft, LogIn, LogOut as CheckOutIcon, Archive, Image as ImageIcon, History,
  Star, MessageSquare, UtensilsCrossed, Sparkles, BarChart3, UserPlus,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { hotelConfig } from "@/config/hotel";

// ─── Types ────────────────────────────────────────────────────────────────────

type GalleryImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};

type Room = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  capacity: number;
  bed_type: string;
  image_url: string | null;
  features: string[];
  is_available: boolean;
};

type Booking = {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string | null;
  room_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests: string | null;
  status: string;
  created_at: string;
};

type HotelSettings = {
  id: string;
  reception_email: string;
  hotel_name: string;
  phone: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  star_rating: number;
  review_score: number;
  review_count: number;
};

type AdminTestimonial = {
  id: string;
  guest_name: string;
  guest_email: string | null;
  rating: number;
  message: string;
  is_approved: boolean;
  created_at: string;
};

type MenuCategory = { id: string; name: string; sort_order: number };
type MenuItem = {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_special: boolean;
  is_available: boolean;
  sort_order: number;
};

type StaffMember = {
  id: string;
  email: string;
  role: string;
  full_name: string | null;
  created_at: string;
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const allTabs = [
  { id: "analytics",    label: "Analytics",      icon: BarChart3       },
  { id: "bookings",     label: "Bookings",        icon: CalendarDays    },
  { id: "guests",       label: "Current Guests",  icon: Users           },
  { id: "history",      label: "History",         icon: History         },
  { id: "rooms",        label: "Rooms & Pricing", icon: BedDouble       },
  { id: "gallery",      label: "Gallery",         icon: ImageIcon       },
  { id: "testimonials", label: "Reviews",         icon: MessageSquare   },
  { id: "menu",         label: "Menu",            icon: UtensilsCrossed },
  { id: "staff",        label: "Staff",           icon: UserPlus        },
  { id: "settings",     label: "Settings",        icon: Settings        },
] as const;

type TabId = typeof allTabs[number]["id"];

const todayStr = () => new Date().toISOString().slice(0, 10);

// ─── Component ────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession]       = useState<Session | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // ── Auth + role check ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      setSession(session);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        if (profile?.role === "receptionist") {
          navigate("/receptionist");
        } else {
          await supabase.auth.signOut();
          navigate("/admin/login");
        }
        return;
      }

      setPageLoading(false);
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/login");
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // ── Tab state ──────────────────────────────────────────────────────────────
  const [tab, setTab] = useState<TabId>("bookings");

  // ── Data state ────────────────────────────────────────────────────────────
  const [rooms,           setRooms]           = useState<Room[]>([]);
  const [editingRoom,     setEditingRoom]     = useState<Partial<Room> | null>(null);
  const [roomImageFile,   setRoomImageFile]   = useState<File | null>(null);
  const [bookings,        setBookings]        = useState<Booking[]>([]);
  const [settings,        setSettings]        = useState<HotelSettings | null>(null);
  const [galleryImages,   setGalleryImages]   = useState<GalleryImage[]>([]);
  const [galleryFile,     setGalleryFile]     = useState<File | null>(null);
  const [galleryCaption,  setGalleryCaption]  = useState("");
  const [galleryUploading,setGalleryUploading]= useState(false);
  const [testimonials,    setTestimonials]    = useState<AdminTestimonial[]>([]);
  const [menuCategories,  setMenuCategories]  = useState<MenuCategory[]>([]);
  const [menuItems,       setMenuItems]       = useState<MenuItem[]>([]);
  const [editingItem,     setEditingItem]     = useState<Partial<MenuItem> | null>(null);
  const [menuImageFile,   setMenuImageFile]   = useState<File | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");

  // ── Staff state ───────────────────────────────────────────────────────────
  const [staffList,     setStaffList]     = useState<StaffMember[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffName,  setNewStaffName]  = useState("");
  const [newStaffPass,  setNewStaffPass]  = useState("");
  const [creatingStaff, setCreatingStaff] = useState(false);

  // ── Fetch all data once session is ready ──────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetchRooms(); fetchBookings(); fetchSettings();
    fetchGallery(); fetchTestimonials(); fetchMenu(); fetchStaff();
  }, [session]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchRooms = async () => {
    const { data } = await supabase.from("rooms").select("*").order("created_at");
    if (data) setRooms(data as Room[]);
  };
  const fetchBookings = async () => {
    const { data } = await supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (data) setBookings(data as Booking[]);
  };
  const fetchSettings = async () => {
    const { data } = await supabase.from("hotel_settings").select("*").limit(1).single();
    if (data) setSettings(data as HotelSettings);
  };
  const fetchGallery = async () => {
    const { data } = await supabase.from("gallery_images").select("*")
      .order("sort_order", { ascending: true }).order("created_at", { ascending: false });
    if (data) setGalleryImages(data as GalleryImage[]);
  };
  const fetchTestimonials = async () => {
    const { data } = await supabase.from("testimonials").select("*").order("created_at", { ascending: false });
    if (data) setTestimonials(data as AdminTestimonial[]);
  };
  const fetchMenu = async () => {
    const [cats, items] = await Promise.all([
      supabase.from("menu_categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
    ]);
    if (cats.data) setMenuCategories(cats.data as MenuCategory[]);
    if (items.data) setMenuItems(items.data as MenuItem[]);
  };
  const fetchStaff = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at");
    if (data) setStaffList(data as StaffMember[]);
  };

  // ── Derived bookings ──────────────────────────────────────────────────────
  const today = todayStr();
  const currentGuests = useMemo(() => bookings.filter(b =>
    b.status === "checked_in" ||
    (b.status === "confirmed" && b.check_in <= today && today < b.check_out)
  ), [bookings, today]);
  const activeBookings  = useMemo(() => bookings.filter(b => b.status !== "archived" && b.status !== "checked_out"), [bookings]);
  const historyBookings = useMemo(() => bookings.filter(b => b.status === "checked_out" || b.status === "archived"), [bookings]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleUploadGallery = async () => {
    if (!galleryFile) { toast.error("Pick an image first."); return; }
    setGalleryUploading(true);
    try {
      const ext = galleryFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery-images").upload(path, galleryFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(path);
      const { error: insErr } = await supabase.from("gallery_images").insert({
        image_url: urlData.publicUrl, caption: galleryCaption || null, sort_order: galleryImages.length,
      });
      if (insErr) throw insErr;
      toast.success("Photo added to gallery");
      setGalleryFile(null); setGalleryCaption(""); fetchGallery();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string, image_url: string) => {
    if (!confirm("Remove this photo from the gallery?")) return;
    await supabase.from("gallery_images").delete().eq("id", id);
    const fileName = image_url.split("/").pop();
    if (fileName) await supabase.storage.from("gallery-images").remove([fileName]);
    toast.success("Photo removed"); fetchGallery();
  };

  const setTestimonialApproval = async (id: string, approved: boolean) => {
    const { error } = await supabase.from("testimonials").update({ is_approved: approved }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(approved ? "Review approved & published" : "Review unpublished"); fetchTestimonials();
  };
  const deleteTestimonial = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    toast.success("Review deleted"); fetchTestimonials();
  };

  const addMenuCategory = async () => {
    if (!newCategoryName.trim()) return;
    const { error } = await supabase.from("menu_categories").insert({ name: newCategoryName.trim(), sort_order: menuCategories.length });
    if (error) { toast.error(error.message); return; }
    toast.success("Category added"); setNewCategoryName(""); fetchMenu();
  };
  const deleteMenuCategory = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    await supabase.from("menu_categories").delete().eq("id", id);
    toast.success("Category deleted"); fetchMenu();
  };

  const handleSaveMenuItem = async () => {
    if (!editingItem?.name || editingItem.price === undefined || editingItem.price === null) {
      toast.error("Item name and price are required."); return;
    }
    let image_url = editingItem.image_url || null;
    if (menuImageFile) {
      const ext = menuImageFile.name.split(".").pop();
      const path = `menu-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery-images").upload(path, menuImageFile);
      if (upErr) { toast.error("Image upload failed: " + upErr.message); return; }
      const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }
    const payload = {
      name: editingItem.name, description: editingItem.description || null,
      price: Number(editingItem.price), category_id: editingItem.category_id || null,
      image_url, is_special: editingItem.is_special ?? false,
      is_available: editingItem.is_available ?? true, sort_order: editingItem.sort_order ?? menuItems.length,
    };
    if (editingItem.id) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editingItem.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Menu item updated");
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) { toast.error(error.message); return; }
      toast.success("Menu item added");
    }
    setEditingItem(null); setMenuImageFile(null); fetchMenu();
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    toast.success("Item deleted"); fetchMenu();
  };

  const handleSaveRoom = async () => {
    if (!editingRoom?.name || !editingRoom.price || !editingRoom.capacity || !editingRoom.bed_type) {
      toast.error("Please fill name, price, capacity, and bed type."); return;
    }
    let image_url = editingRoom.image_url || null;
    if (roomImageFile) {
      const ext = roomImageFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from("room-images").upload(path, roomImageFile);
      if (uploadErr) { toast.error("Image upload failed: " + uploadErr.message); return; }
      const { data: urlData } = supabase.storage.from("room-images").getPublicUrl(path);
      image_url = urlData.publicUrl;
    }
    const roomData = {
      name: editingRoom.name, description: editingRoom.description || null,
      price: Number(editingRoom.price), capacity: Number(editingRoom.capacity),
      bed_type: editingRoom.bed_type, image_url, features: editingRoom.features || [],
      is_available: editingRoom.is_available ?? true,
    };
    if (editingRoom.id) {
      const { error } = await supabase.from("rooms").update(roomData).eq("id", editingRoom.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Room updated!");
    } else {
      const { error } = await supabase.from("rooms").insert(roomData);
      if (error) { toast.error(error.message); return; }
      toast.success("Room added!");
    }
    setEditingRoom(null); setRoomImageFile(null); fetchRooms();
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    toast.success("Room deleted"); fetchRooms();
  };

  const handleBookingStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`Booking ${status.replace("_", " ")}`);
    if (status === "confirmed") {
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        const { error: emailErr } = await supabase.functions.invoke("send-booking-confirmation", {
          body: {
            booking: {
              guest_name: booking.guest_name, guest_email: booking.guest_email,
              guest_phone: booking.guest_phone, room_name: booking.room_name,
              check_in: booking.check_in, check_out: booking.check_out,
              guests: booking.guests, special_requests: booking.special_requests,
            },
            hotel_name: settings?.hotel_name || hotelConfig.fullName,
            phone: settings?.phone || hotelConfig.phone,
            reception_email: settings?.reception_email,
          },
        });
        if (emailErr) toast.error("Booking confirmed, but email failed: " + emailErr.message);
        else toast.success("Confirmation email sent to guest");
      }
    }
    fetchBookings();
  };

  const handleArchiveBooking = async (id: string, guestName: string) => {
    if (!confirm(`Delete the booking record for "${guestName}"?`)) return;
    const { error } = await supabase.from("bookings").update({ status: "archived" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking archived"); fetchBookings();
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from("hotel_settings").update({
      reception_email: settings.reception_email, hotel_name: settings.hotel_name,
      phone: settings.phone, check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time, star_rating: settings.star_rating,
      review_score: settings.review_score, review_count: settings.review_count,
    }).eq("id", settings.id);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
  };

  // ── Create receptionist account ───────────────────────────────────────────
  const handleCreateReceptionist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffEmail || !newStaffPass || !newStaffName) {
      toast.error("Please fill in all fields."); return;
    }
    if (newStaffPass.length < 6) {
      toast.error("Password must be at least 6 characters."); return;
    }
    setCreatingStaff(true);
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-receptionist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${currentSession?.access_token}`,
          },
          body: JSON.stringify({ email: newStaffEmail, password: newStaffPass, full_name: newStaffName }),
        }
      );
      const result = await response.json();
      if (result.error) throw new Error(result.error);
      toast.success(`Receptionist account created for ${newStaffName}!`);
      setNewStaffEmail(""); setNewStaffPass(""); setNewStaffName("");
      fetchStaff();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setCreatingStaff(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (id === session?.user.id) { toast.error("You cannot delete your own account."); return; }
    if (!confirm(`Remove ${name}'s account? They will no longer be able to log in.`)) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(`${name}'s account removed`); fetchStaff();
  };

  // ── Loading guard ─────────────────────────────────────────────────────────
  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      checked_in: "bg-blue-100 text-blue-800",
      checked_out: "bg-gray-100 text-gray-700",
      declined: "bg-red-100 text-red-800",
      archived: "bg-gray-100 text-gray-500",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return styles[status] || "bg-yellow-100 text-yellow-800";
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-warm-dark border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-5 h-5 text-gold" />
          <span className="font-heading text-lg text-primary-foreground font-semibold">
            {hotelConfig.name} — Admin
          </span>
          <span className="ml-2 text-[10px] uppercase tracking-wider font-body font-semibold px-2 py-0.5 rounded-full bg-gold/20 text-gold">
            admin
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

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-56 bg-card border-r border-border min-h-[calc(100vh-52px)] p-4 space-y-1">
          {allTabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md font-body text-sm transition-colors ${tab === t.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"}`}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.id === "guests" && currentGuests.length > 0 && (
                <span className="ml-auto bg-gold text-primary-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                  {currentGuests.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 max-w-5xl">

          {/* ── ANALYTICS ── */}
          {tab === "analytics" && (() => {
            const nightsBetween = (a: string, b: string) => Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
            const priceFor = (name: string) => rooms.find(r => r.name === name)?.price ?? 0;
            const isRevenue = (s: string) => ["confirmed","checked_in","checked_out","archived"].includes(s);
            const totalRevenue = bookings.filter(b => isRevenue(b.status)).reduce((sum, b) => sum + priceFor(b.room_name) * nightsBetween(b.check_in, b.check_out), 0);
            const totalBookings = bookings.length;
            const activeGuests = bookings.filter(b => b.status === "checked_in").length;
            const completed = bookings.filter(b => ["checked_out","archived"].includes(b.status)).length;
            const months: { label: string; count: number; revenue: number }[] = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
              const mb = bookings.filter(b => { const bd = new Date(b.created_at); return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth(); });
              months.push({ label, count: mb.length, revenue: mb.filter(b => isRevenue(b.status)).reduce((s, b) => s + priceFor(b.room_name) * nightsBetween(b.check_in, b.check_out), 0) });
            }
            const maxCount = Math.max(1, ...months.map(m => m.count));
            const roomCounts: Record<string, number> = {};
            bookings.forEach(b => { roomCounts[b.room_name] = (roomCounts[b.room_name] || 0) + 1; });
            const topRooms = Object.entries(roomCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
            const todayD = new Date(); todayD.setHours(0,0,0,0);
            const horizon = 30; let occupied = 0;
            for (let i = 0; i < horizon; i++) {
              const day = new Date(todayD); day.setDate(todayD.getDate() + i);
              const ds = day.toISOString().slice(0,10);
              bookings.forEach(b => { if (!["confirmed","checked_in"].includes(b.status)) return; if (b.check_in <= ds && ds < b.check_out) occupied++; });
            }
            const occupancyPct = Math.min(100, Math.round((occupied / Math.max(1, rooms.length * horizon)) * 100));
            return (
              <div>
                <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Analytics</h2>
                <p className="font-body text-sm text-muted-foreground mb-6">Revenue, bookings and occupancy at a glance.</p>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Revenue", value: `${totalRevenue.toLocaleString()} ${hotelConfig.currency}` },
                    { label: "Total Bookings", value: totalBookings },
                    { label: "Active Guests", value: activeGuests },
                    { label: `Occupancy (${horizon}d)`, value: `${occupancyPct}%` },
                  ].map(k => (
                    <div key={k.label} className="bg-card border border-border rounded-xl p-4">
                      <p className="font-body text-xs text-muted-foreground uppercase tracking-wide">{k.label}</p>
                      <p className="font-heading text-2xl font-bold text-foreground mt-1">{k.value}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-card border border-border rounded-xl p-5 mb-6">
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Bookings — last 6 months</h3>
                  <div className="flex items-end gap-3 h-48">
                    {months.map(m => (
                      <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-xs font-body text-muted-foreground">{m.count}</div>
                        <div className="w-full bg-primary/80 rounded-t-md transition-all" style={{ height: `${(m.count/maxCount)*100}%`, minHeight: m.count > 0 ? "6px" : "2px" }} />
                        <div className="text-xs font-body text-muted-foreground">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Top rooms</h3>
                    {topRooms.length === 0 ? <p className="font-body text-sm text-muted-foreground">No bookings yet.</p> : (
                      <ul className="space-y-3">{topRooms.map(([name, count]) => (
                        <li key={name} className="flex items-center justify-between">
                          <span className="font-body text-sm text-foreground">{name}</span>
                          <span className="font-body text-sm font-medium text-primary">{count} bookings</span>
                        </li>
                      ))}</ul>
                    )}
                  </div>
                  <div className="bg-card border border-border rounded-xl p-5">
                    <h3 className="font-heading text-lg font-semibold text-foreground mb-4">Status breakdown</h3>
                    <ul className="space-y-3">
                      {["pending","confirmed","checked_in","checked_out","archived","cancelled"].map(s => {
                        const c = bookings.filter(b => b.status === s).length;
                        return (<li key={s} className="flex items-center justify-between">
                          <span className="font-body text-sm text-foreground capitalize">{s.replace("_"," ")}</span>
                          <span className="font-body text-sm font-medium text-muted-foreground">{c}</span>
                        </li>);
                      })}
                      <li className="flex items-center justify-between border-t border-border pt-3 mt-3">
                        <span className="font-body text-sm font-semibold text-foreground">Completed stays</span>
                        <span className="font-body text-sm font-bold text-primary">{completed}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ── CURRENT GUESTS ── */}
          {tab === "guests" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Current Guests</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">Guests currently staying at the hotel.</p>
              {currentGuests.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">No guests currently in the hotel.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentGuests.map(b => (
                    <div key={b.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-body font-semibold text-foreground">{b.guest_name}</p>
                          <p className="font-body text-sm text-muted-foreground">{b.guest_email}{b.guest_phone && ` • ${b.guest_phone}`}</p>
                        </div>
                        <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>
                          {b.status === "checked_in" ? "checked in" : "in-house"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground mb-3">
                        <span>🛏️ {b.room_name}</span><span>📅 {b.check_in} → {b.check_out}</span><span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.status !== "checked_in" && (
                          <button onClick={() => handleBookingStatus(b.id, "checked_in")} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-body hover:bg-blue-700">
                            <LogIn className="w-3 h-3" /> Mark Checked In
                          </button>
                        )}
                        <button onClick={() => handleBookingStatus(b.id, "checked_out")} className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-md text-xs font-body hover:bg-gray-700">
                          <CheckOutIcon className="w-3 h-3" /> Check Out
                        </button>
                        <button onClick={() => handleArchiveBooking(b.id, b.guest_name)} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80 ml-auto">
                          <Archive className="w-3 h-3" /> Delete Info
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── HISTORY ── */}
          {tab === "history" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Guest History</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">All past guests — saved after check-out or archiving.</p>
              {historyBookings.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <History className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">No guest history yet.</p>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-body">
                      <thead className="bg-secondary text-foreground">
                        <tr>
                          {["Guest","Email","Phone","Room","Check-in","Check-out","Guests","Status"].map(h => (
                            <th key={h} className="text-left px-4 py-2.5 font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {historyBookings.map(b => (
                          <tr key={b.id} className="border-t border-border hover:bg-secondary/50">
                            <td className="px-4 py-2.5 text-foreground font-medium">{b.guest_name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.guest_email}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.guest_phone || "—"}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.room_name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.check_in}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.check_out}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{b.guests}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>{b.status.replace("_"," ")}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── BOOKINGS ── */}
          {tab === "bookings" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Booking Requests</h2>
              {activeBookings.length === 0 ? (
                <p className="text-muted-foreground font-body">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {activeBookings.map(b => (
                    <div key={b.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-body font-semibold text-foreground">{b.guest_name}</p>
                          <p className="font-body text-sm text-muted-foreground">{b.guest_email} {b.guest_phone && `• ${b.guest_phone}`}</p>
                        </div>
                        <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>{b.status.replace("_"," ")}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground mb-2">
                        <span>🛏️ {b.room_name}</span><span>📅 {b.check_in} → {b.check_out}</span><span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      </div>
                      {b.special_requests && <p className="text-sm font-body text-muted-foreground italic mb-2">"{b.special_requests}"</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {b.status === "pending" && (<>
                          <button onClick={() => handleBookingStatus(b.id, "confirmed")} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-body hover:bg-green-700"><Check className="w-3 h-3" /> Confirm</button>
                          <button onClick={() => handleBookingStatus(b.id, "declined")} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-body hover:bg-red-700"><X className="w-3 h-3" /> Decline</button>
                        </>)}
                        {b.status === "confirmed" && (
                          <button onClick={() => handleBookingStatus(b.id, "checked_in")} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-body hover:bg-blue-700"><LogIn className="w-3 h-3" /> Mark Checked In</button>
                        )}
                        <button onClick={() => handleArchiveBooking(b.id, b.guest_name)} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80 ml-auto"><Archive className="w-3 h-3" /> Delete Info</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ROOMS ── */}
          {tab === "rooms" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Manage Rooms</h2>
                <button onClick={() => setEditingRoom({ name: "", description: "", price: 0, capacity: 2, bed_type: "1 King Bed", features: [], is_available: true })}
                  className="flex items-center gap-1.5 gold-gradient px-4 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90">
                  <Plus className="w-4 h-4" /> Add Room
                </button>
              </div>
              {editingRoom && (
                <div className="bg-card border border-border rounded-lg p-5 mb-6 space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{editingRoom.id ? "Edit Room" : "Add New Room"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Room Name *</label>
                      <input value={editingRoom.name || ""} onChange={e => setEditingRoom(p => ({ ...p!, name: e.target.value }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="e.g. Deluxe Double Room" /></div>
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Price per Night ({hotelConfig.currency}) *</label>
                      <input type="number" value={editingRoom.price || ""} onChange={e => setEditingRoom(p => ({ ...p!, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Number of Guests *</label>
                      <select value={editingRoom.capacity || 2} onChange={e => setEditingRoom(p => ({ ...p!, capacity: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n===1?"Person":"People"}</option>)}
                      </select></div>
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Bed Type *</label>
                      <input value={editingRoom.bed_type || ""} onChange={e => setEditingRoom(p => ({ ...p!, bed_type: e.target.value }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="e.g. 1 King Bed" /></div>
                  </div>
                  <div><label className="block font-body text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea value={editingRoom.description || ""} onChange={e => setEditingRoom(p => ({ ...p!, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none" /></div>
                  <div><label className="block font-body text-sm font-medium text-foreground mb-1">Features (comma-separated)</label>
                    <input value={(editingRoom.features || []).join(", ")} onChange={e => setEditingRoom(p => ({ ...p!, features: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="Free Wi-Fi, Breakfast Included" /></div>
                  <div><label className="block font-body text-sm font-medium text-foreground mb-1">Room Photo</label>
                    <input type="file" accept="image/*" onChange={e => setRoomImageFile(e.target.files?.[0] || null)} className="w-full font-body text-sm text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium file:cursor-pointer" /></div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={editingRoom.is_available ?? true} onChange={e => setEditingRoom(p => ({ ...p!, is_available: e.target.checked }))} id="avail" />
                    <label htmlFor="avail" className="font-body text-sm text-foreground">Available for booking</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveRoom} className="gold-gradient px-5 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90">Save Room</button>
                    <button onClick={() => { setEditingRoom(null); setRoomImageFile(null); }} className="px-5 py-2 rounded-md border border-border font-body text-sm text-foreground hover:bg-secondary">Cancel</button>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {rooms.map(room => (
                  <div key={room.id} className="bg-card border border-border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start">
                    {room.image_url && <img src={room.image_url} alt={room.name} className="w-28 h-20 object-cover rounded-md" />}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-body font-semibold text-foreground">{room.name}</h3>
                        {!room.is_available && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-body">Unavailable</span>}
                      </div>
                      <p className="text-sm text-muted-foreground font-body mb-1">{room.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                        <span>💰 {hotelConfig.currency} {room.price.toLocaleString()}/night</span>
                        <span>👥 {room.capacity} {room.capacity===1?"person":"people"}</span>
                        <span>🛏️ {room.bed_type}</span>
                        {room.features.map(f => <span key={f} className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full">{f}</span>)}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button onClick={() => setEditingRoom(room)} className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteRoom(room.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── GALLERY ── */}
          {tab === "gallery" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Gallery</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">Upload photos to display on the public Gallery page.</p>
              <div className="bg-card border border-border rounded-lg p-5 space-y-4 max-w-lg mb-6">
                <div><label className="block font-body text-sm font-medium text-foreground mb-1">Photo</label>
                  <input type="file" accept="image/*" onChange={e => setGalleryFile(e.target.files?.[0] || null)} className="w-full font-body text-sm text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium file:cursor-pointer" /></div>
                <div><label className="block font-body text-sm font-medium text-foreground mb-1">Caption (optional)</label>
                  <input value={galleryCaption} onChange={e => setGalleryCaption(e.target.value)} placeholder="e.g. Lobby at sunset" className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                <button onClick={handleUploadGallery} disabled={galleryUploading || !galleryFile} className="gold-gradient px-5 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  {galleryUploading ? "Uploading…" : "Add Photo"}
                </button>
              </div>
              {galleryImages.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">No photos yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.map(img => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-secondary">
                      <img src={img.image_url} alt={img.caption || "Gallery photo"} className="w-full h-full object-cover" />
                      <button onClick={() => handleDeleteGalleryImage(img.id, img.image_url)} className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                      {img.caption && <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2"><p className="font-body text-xs text-white truncate">{img.caption}</p></div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── TESTIMONIALS ── */}
          {tab === "testimonials" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Guest Reviews</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">Approve reviews to publish them on the website.</p>
              {testimonials.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">No reviews submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testimonials.map(t => (
                    <div key={t.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-body font-semibold text-foreground">{t.guest_name}</p>
                          {t.guest_email && <p className="font-body text-xs text-muted-foreground">{t.guest_email}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex">{Array.from({length:5}).map((_,i) => <Star key={i} className={`w-4 h-4 ${i<t.rating?"fill-gold text-gold":"text-muted-foreground/30"}`} />)}</div>
                          <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${t.is_approved?"bg-green-100 text-green-800":"bg-yellow-100 text-yellow-800"}`}>{t.is_approved?"Published":"Pending"}</span>
                        </div>
                      </div>
                      <p className="font-body text-sm text-foreground italic mb-3">"{t.message}"</p>
                      <div className="flex flex-wrap gap-2">
                        {t.is_approved ? (
                          <button onClick={() => setTestimonialApproval(t.id, false)} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80"><X className="w-3 h-3" /> Unpublish</button>
                        ) : (
                          <button onClick={() => setTestimonialApproval(t.id, true)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-body hover:bg-green-700"><Check className="w-3 h-3" /> Approve & Publish</button>
                        )}
                        <button onClick={() => deleteTestimonial(t.id)} className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80 ml-auto"><Trash2 className="w-3 h-3" /> Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── MENU ── */}
          {tab === "menu" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading text-2xl font-bold text-foreground">Restaurant Menu</h2>
                <button onClick={() => setEditingItem({ name: "", description: "", price: 0, category_id: menuCategories[0]?.id || null, is_special: false, is_available: true })}
                  className="flex items-center gap-1.5 gold-gradient px-4 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90"><Plus className="w-4 h-4" /> Add Item</button>
              </div>
              <div className="bg-card border border-border rounded-lg p-4 mb-5">
                <p className="font-body text-sm font-semibold text-foreground mb-2">Categories</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {menuCategories.map(c => (
                    <span key={c.id} className="inline-flex items-center gap-1.5 bg-secondary text-foreground px-3 py-1 rounded-full text-xs font-body">
                      {c.name}<button onClick={() => deleteMenuCategory(c.id)}><X className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="New category name" className="flex-1 px-3 py-1.5 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                  <button onClick={addMenuCategory} className="px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80">Add</button>
                </div>
              </div>
              {editingItem && (
                <div className="bg-card border border-border rounded-lg p-5 mb-6 space-y-4">
                  <h3 className="font-heading text-lg font-semibold text-foreground">{editingItem.id ? "Edit Item" : "Add New Item"}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Item Name *</label>
                      <input value={editingItem.name || ""} onChange={e => setEditingItem(p => ({ ...p!, name: e.target.value }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="e.g. Grilled Tilapia" /></div>
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Price ({hotelConfig.currency}) *</label>
                      <input type="number" value={editingItem.price ?? ""} onChange={e => setEditingItem(p => ({ ...p!, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Category</label>
                      <select value={editingItem.category_id || ""} onChange={e => setEditingItem(p => ({ ...p!, category_id: e.target.value || null }))} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                        <option value="">— Uncategorized —</option>
                        {menuCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select></div>
                    <div><label className="block font-body text-sm font-medium text-foreground mb-1">Photo (optional)</label>
                      <input type="file" accept="image/*" onChange={e => setMenuImageFile(e.target.files?.[0] || null)} className="w-full font-body text-sm text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium file:cursor-pointer" /></div>
                  </div>
                  <div><label className="block font-body text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea value={editingItem.description || ""} onChange={e => setEditingItem(p => ({ ...p!, description: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none" /></div>
                  <div className="flex items-center gap-5">
                    <label className="flex items-center gap-2 font-body text-sm text-foreground"><input type="checkbox" checked={editingItem.is_special ?? false} onChange={e => setEditingItem(p => ({ ...p!, is_special: e.target.checked }))} /><Sparkles className="w-4 h-4 text-gold" /> Daily Special</label>
                    <label className="flex items-center gap-2 font-body text-sm text-foreground"><input type="checkbox" checked={editingItem.is_available ?? true} onChange={e => setEditingItem(p => ({ ...p!, is_available: e.target.checked }))} /> Available</label>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSaveMenuItem} className="gold-gradient px-5 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90">Save Item</button>
                    <button onClick={() => { setEditingItem(null); setMenuImageFile(null); }} className="px-5 py-2 rounded-md border border-border font-body text-sm text-foreground hover:bg-secondary">Cancel</button>
                  </div>
                </div>
              )}
              {menuItems.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center"><UtensilsCrossed className="w-10 h-10 text-muted-foreground mx-auto mb-2" /><p className="text-muted-foreground font-body">No menu items yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {menuItems.map(item => {
                    const cat = menuCategories.find(c => c.id === item.category_id);
                    return (
                      <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4 items-start">
                        {item.image_url && <img src={item.image_url} alt={item.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-body font-semibold text-foreground">{item.name}</h3>
                            {item.is_special && <span className="text-xs bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full font-body">Special</span>}
                            {!item.is_available && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-body">Unavailable</span>}
                          </div>
                          <p className="text-sm text-muted-foreground font-body mb-1">{item.description}</p>
                          <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                            <span>💰 {hotelConfig.currency} {item.price.toLocaleString()}</span>
                            {cat && <span>🏷️ {cat.name}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => setEditingItem(item)} className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => deleteMenuItem(item.id)} className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── STAFF ── */}
          {tab === "staff" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Staff Management</h2>
              <p className="font-body text-sm text-muted-foreground mb-6">Create receptionist accounts and manage your team.</p>
              <div className="bg-card border border-border rounded-lg p-5 mb-8 max-w-lg">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold" /> Create Receptionist Account
                </h3>
                <form onSubmit={handleCreateReceptionist} className="space-y-4">
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Full Name</label>
                    <input value={newStaffName} onChange={e => setNewStaffName(e.target.value)} required placeholder="e.g. Marie Uwimana"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Email Address</label>
                    <input type="email" value={newStaffEmail} onChange={e => setNewStaffEmail(e.target.value)} required placeholder="receptionist@hotel.com"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Password</label>
                    <input type="password" value={newStaffPass} onChange={e => setNewStaffPass(e.target.value)} required placeholder="Min. 6 characters"
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                  </div>
                  <button type="submit" disabled={creatingStaff}
                    className="w-full gold-gradient px-5 py-2.5 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60">
                    {creatingStaff ? "Creating account…" : "Create Receptionist Account"}
                  </button>
                </form>
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-3">Current Staff</h3>
              {staffList.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">No staff accounts yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {staffList.map(s => (
                    <div key={s.id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-body font-semibold text-foreground">{s.full_name || "—"}</p>
                        <p className="font-body text-sm text-muted-foreground">{s.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${s.role === "admin" ? "bg-gold/20 text-gold" : "bg-blue-100 text-blue-700"}`}>
                          {s.role}
                        </span>
                        {s.role !== "admin" && (
                          <button onClick={() => handleDeleteStaff(s.id, s.full_name || s.email)}
                            className="p-2 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {tab === "settings" && settings && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Hotel Settings</h2>
              <div className="bg-card border border-border rounded-lg p-5 space-y-4 max-w-lg">
                <div><label className="block font-body text-sm font-medium text-foreground mb-1">Reception Email</label>
                  <p className="text-xs text-muted-foreground font-body mb-1.5">Booking notifications are sent to this email</p>
                  <input value={settings.reception_email} onChange={e => setSettings(p => p ? { ...p, reception_email: e.target.value } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                <div><label className="block font-body text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <input value={settings.phone || ""} onChange={e => setSettings(p => p ? { ...p, phone: e.target.value } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block font-body text-sm font-medium text-foreground mb-1">Check-in Time</label>
                    <input value={settings.check_in_time || ""} onChange={e => setSettings(p => p ? { ...p, check_in_time: e.target.value } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="16:00" /></div>
                  <div><label className="block font-body text-sm font-medium text-foreground mb-1">Check-out Time</label>
                    <input value={settings.check_out_time || ""} onChange={e => setSettings(p => p ? { ...p, check_out_time: e.target.value } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" placeholder="11:00" /></div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="font-body text-sm font-semibold text-foreground mb-1">Public Ratings</p>
                  <p className="text-xs text-muted-foreground font-body mb-3">Shown on the About section of your website.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block font-body text-xs font-medium text-foreground mb-1">Star Rating</label>
                      <input type="number" min={1} max={5} step={1} value={settings.star_rating ?? 0} onChange={e => setSettings(p => p ? { ...p, star_rating: Number(e.target.value) } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                    <div><label className="block font-body text-xs font-medium text-foreground mb-1">Review Score</label>
                      <input type="number" min={0} max={5} step={0.1} value={settings.review_score ?? 0} onChange={e => setSettings(p => p ? { ...p, review_score: Number(e.target.value) } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                    <div><label className="block font-body text-xs font-medium text-foreground mb-1"># of Reviews</label>
                      <input type="number" min={0} step={1} value={settings.review_count ?? 0} onChange={e => setSettings(p => p ? { ...p, review_count: Number(e.target.value) } : p)} className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" /></div>
                  </div>
                </div>
                <button onClick={handleSaveSettings} className="gold-gradient px-5 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90">Save Settings</button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
