import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  LogOut, Hotel, BedDouble, CalendarDays, Settings, Plus, Pencil, Trash2,
  Check, X, Users, ArrowLeft, LogIn, LogOut as CheckOutIcon, Archive, Image as ImageIcon, History,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { hotelConfig } from "@/config/hotel";

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

const tabs = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "guests", label: "Current Guests", icon: Users },
  { id: "history", label: "History", icon: History },
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

type TabId = typeof tabs[number]["id"];

const todayStr = () => new Date().toISOString().slice(0, 10);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("bookings");

  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [roomImageFile, setRoomImageFile] = useState<File | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<HotelSettings | null>(null);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryUploading, setGalleryUploading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { navigate("/admin/login"); return; }
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/admin/login");
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!session) return;
    fetchRooms();
    fetchBookings();
    fetchSettings();
    fetchGallery();
  }, [session]);

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
    const { data } = await supabase
      .from("gallery_images")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (data) setGalleryImages(data as GalleryImage[]);
  };

  const handleUploadGallery = async () => {
    if (!galleryFile) { toast.error("Pick an image first."); return; }
    setGalleryUploading(true);
    try {
      const ext = galleryFile.name.split(".").pop();
      const path = `${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("gallery-images")
        .upload(path, galleryFile);
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from("gallery-images").getPublicUrl(path);
      const { error: insErr } = await supabase.from("gallery_images").insert({
        image_url: urlData.publicUrl,
        caption: galleryCaption || null,
        sort_order: galleryImages.length,
      });
      if (insErr) throw insErr;
      toast.success("Photo added to gallery");
      setGalleryFile(null);
      setGalleryCaption("");
      fetchGallery();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string, image_url: string) => {
    if (!confirm("Remove this photo from the gallery?")) return;
    await supabase.from("gallery_images").delete().eq("id", id);
    // Best-effort delete from storage
    const fileName = image_url.split("/").pop();
    if (fileName) await supabase.storage.from("gallery-images").remove([fileName]);
    toast.success("Photo removed");
    fetchGallery();
  };

  // ─── Derived: split bookings ─────────────────────────────────
  // "Current guests" = checked_in OR (confirmed AND today between check_in/check_out)
  const today = todayStr();
  const currentGuests = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === "checked_in") return true;
      if (b.status === "confirmed" && b.check_in <= today && today < b.check_out) return true;
      return false;
    });
  }, [bookings, today]);

  // Active bookings shown in "Bookings" tab — exclude archived & checked_out
  const activeBookings = useMemo(
    () => bookings.filter(b => b.status !== "archived" && b.status !== "checked_out"),
    [bookings]
  );

  // Guest history — anyone who checked out OR was archived. Newest first.
  const historyBookings = useMemo(
    () => bookings.filter(b => b.status === "checked_out" || b.status === "archived"),
    [bookings]
  );

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const handleSaveRoom = async () => {
    if (!editingRoom?.name || !editingRoom.price || !editingRoom.capacity || !editingRoom.bed_type) {
      toast.error("Please fill name, price, capacity, and bed type.");
      return;
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
      name: editingRoom.name,
      description: editingRoom.description || null,
      price: Number(editingRoom.price),
      capacity: Number(editingRoom.capacity),
      bed_type: editingRoom.bed_type,
      image_url,
      features: editingRoom.features || [],
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
    setEditingRoom(null);
    setRoomImageFile(null);
    fetchRooms();
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm("Delete this room?")) return;
    await supabase.from("rooms").delete().eq("id", id);
    toast.success("Room deleted");
    fetchRooms();
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
              guest_name: booking.guest_name,
              guest_email: booking.guest_email,
              guest_phone: booking.guest_phone,
              room_name: booking.room_name,
              check_in: booking.check_in,
              check_out: booking.check_out,
              guests: booking.guests,
              special_requests: booking.special_requests,
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
    if (!confirm(`Delete the booking record for "${guestName}"?\n\nThis archives the record (it stays in the database for audit) and removes it from active lists.`)) return;
    const { error } = await supabase.from("bookings").update({ status: "archived" }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Booking archived");
    fetchBookings();
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    const { error } = await supabase.from("hotel_settings").update({
      reception_email: settings.reception_email,
      hotel_name: settings.hotel_name,
      phone: settings.phone,
      check_in_time: settings.check_in_time,
      check_out_time: settings.check_out_time,
      star_rating: settings.star_rating,
      review_score: settings.review_score,
      review_count: settings.review_count,
    }).eq("id", settings.id);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-warm-dark border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-5 h-5 text-gold" />
          <span className="font-heading text-lg text-primary-foreground font-semibold">
            {hotelConfig.name} — Reception
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
          {tabs.map(t => (
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
          {/* CURRENT GUESTS TAB */}
          {tab === "guests" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Current Guests</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">
                Guests currently staying at the hotel — auto-detected from confirmed bookings whose dates include today, plus anyone manually checked in.
              </p>
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
                          <p className="font-body text-sm text-muted-foreground">
                            {b.guest_email}{b.guest_phone && ` • ${b.guest_phone}`}
                          </p>
                        </div>
                        <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>
                          {b.status === "checked_in" ? "checked in" : "in-house"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground mb-3">
                        <span>🛏️ {b.room_name}</span>
                        <span>📅 {b.check_in} → {b.check_out}</span>
                        <span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.status !== "checked_in" && (
                          <button onClick={() => handleBookingStatus(b.id, "checked_in")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-body hover:bg-blue-700">
                            <LogIn className="w-3 h-3" /> Mark Checked In
                          </button>
                        )}
                        <button onClick={() => handleBookingStatus(b.id, "checked_out")}
                          className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-md text-xs font-body hover:bg-gray-700">
                          <CheckOutIcon className="w-3 h-3" /> Check Out
                        </button>
                        <button onClick={() => handleArchiveBooking(b.id, b.guest_name)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80 ml-auto">
                          <Archive className="w-3 h-3" /> Delete Info
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* HISTORY TAB */}
          {tab === "history" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Guest History</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">
                All past guests — automatically saved here once a guest is checked out or their booking is archived.
              </p>
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
                          <th className="text-left px-4 py-2.5 font-medium">Guest</th>
                          <th className="text-left px-4 py-2.5 font-medium">Email</th>
                          <th className="text-left px-4 py-2.5 font-medium">Phone</th>
                          <th className="text-left px-4 py-2.5 font-medium">Room</th>
                          <th className="text-left px-4 py-2.5 font-medium">Check-in</th>
                          <th className="text-left px-4 py-2.5 font-medium">Check-out</th>
                          <th className="text-left px-4 py-2.5 font-medium">Guests</th>
                          <th className="text-left px-4 py-2.5 font-medium">Status</th>
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
                              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>
                                {b.status.replace("_", " ")}
                              </span>
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
                        <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${statusBadge(b.status)}`}>
                          {b.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground mb-2">
                        <span>🛏️ {b.room_name}</span>
                        <span>📅 {b.check_in} → {b.check_out}</span>
                        <span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      </div>
                      {b.special_requests && <p className="text-sm font-body text-muted-foreground italic mb-2">"{b.special_requests}"</p>}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {b.status === "pending" && (
                          <>
                            <button onClick={() => handleBookingStatus(b.id, "confirmed")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-body hover:bg-green-700">
                              <Check className="w-3 h-3" /> Confirm
                            </button>
                            <button onClick={() => handleBookingStatus(b.id, "declined")}
                              className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-body hover:bg-red-700">
                              <X className="w-3 h-3" /> Decline
                            </button>
                          </>
                        )}
                        {b.status === "confirmed" && (
                          <button onClick={() => handleBookingStatus(b.id, "checked_in")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-md text-xs font-body hover:bg-blue-700">
                            <LogIn className="w-3 h-3" /> Mark Checked In
                          </button>
                        )}
                        <button onClick={() => handleArchiveBooking(b.id, b.guest_name)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-foreground rounded-md text-xs font-body hover:bg-secondary/80 ml-auto">
                          <Archive className="w-3 h-3" /> Delete Info
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ROOMS TAB */}
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
                    <div>
                      <label className="block font-body text-sm font-medium text-foreground mb-1">Room Name *</label>
                      <input value={editingRoom.name || ""} onChange={e => setEditingRoom(p => ({ ...p!, name: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder="e.g. Deluxe Double Room" />
                    </div>
                    <div>
                      <label className="block font-body text-sm font-medium text-foreground mb-1">Price per Night ({hotelConfig.currency}) *</label>
                      <input type="number" value={editingRoom.price || ""} onChange={e => setEditingRoom(p => ({ ...p!, price: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder="30984" />
                    </div>
                    <div>
                      <label className="block font-body text-sm font-medium text-foreground mb-1">Number of Guests *</label>
                      <select value={editingRoom.capacity || 2} onChange={e => setEditingRoom(p => ({ ...p!, capacity: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none">
                        {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} {n === 1 ? "Person" : "People"}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-body text-sm font-medium text-foreground mb-1">Bed Type *</label>
                      <input value={editingRoom.bed_type || ""} onChange={e => setEditingRoom(p => ({ ...p!, bed_type: e.target.value }))}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                        placeholder="e.g. 1 King Bed, 2 Twin Beds" />
                    </div>
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Description</label>
                    <textarea value={editingRoom.description || ""} onChange={e => setEditingRoom(p => ({ ...p!, description: e.target.value }))} rows={2}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none resize-none"
                      placeholder="Describe the room..." />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Features (comma-separated)</label>
                    <input value={(editingRoom.features || []).join(", ")} onChange={e => setEditingRoom(p => ({ ...p!, features: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                      placeholder="Free Wi-Fi, Free Parking, Breakfast Included" />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Room Photo</label>
                    <input type="file" accept="image/*" onChange={e => setRoomImageFile(e.target.files?.[0] || null)}
                      className="w-full font-body text-sm text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium file:cursor-pointer" />
                  </div>
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
                    {room.image_url && (
                      <img src={room.image_url} alt={room.name} className="w-28 h-20 object-cover rounded-md" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-body font-semibold text-foreground">{room.name}</h3>
                        {!room.is_available && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-body">Unavailable</span>}
                      </div>
                      <p className="text-sm text-muted-foreground font-body mb-1">{room.description}</p>
                      <div className="flex flex-wrap gap-3 text-xs font-body text-muted-foreground">
                        <span>💰 {hotelConfig.currency} {room.price.toLocaleString()}/night</span>
                        <span>👥 {room.capacity} {room.capacity === 1 ? "person" : "people"}</span>
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

          {/* GALLERY TAB */}
          {tab === "gallery" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-1">Gallery</h2>
              <p className="font-body text-sm text-muted-foreground mb-5">
                Upload photos to display on the public Gallery page.
              </p>

              <div className="bg-card border border-border rounded-lg p-5 space-y-4 max-w-lg mb-6">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setGalleryFile(e.target.files?.[0] || null)}
                    className="w-full font-body text-sm text-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-secondary file:text-secondary-foreground file:font-medium file:cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Caption (optional)</label>
                  <input
                    value={galleryCaption}
                    onChange={e => setGalleryCaption(e.target.value)}
                    placeholder="e.g. Lobby at sunset"
                    className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleUploadGallery}
                  disabled={galleryUploading || !galleryFile}
                  className="gold-gradient px-5 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {galleryUploading ? "Uploading…" : "Add Photo"}
                </button>
              </div>

              {galleryImages.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-8 text-center">
                  <ImageIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground font-body">No photos yet. Add the first one above.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {galleryImages.map(img => (
                    <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg bg-secondary">
                      <img src={img.image_url} alt={img.caption || "Gallery photo"} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleDeleteGalleryImage(img.id, img.image_url)}
                        className="absolute top-2 right-2 p-1.5 rounded-md bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {img.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="font-body text-xs text-white truncate">{img.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === "settings" && settings && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Hotel Settings</h2>
              <div className="bg-card border border-border rounded-lg p-5 space-y-4 max-w-lg">
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Reception Email</label>
                  <p className="text-xs text-muted-foreground font-body mb-1.5">Booking notifications are sent to this email</p>
                  <input value={settings.reception_email} onChange={e => setSettings(p => p ? { ...p, reception_email: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Phone Number</label>
                  <input value={settings.phone || ""} onChange={e => setSettings(p => p ? { ...p, phone: e.target.value } : p)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Check-in Time</label>
                    <input value={settings.check_in_time || ""} onChange={e => setSettings(p => p ? { ...p, check_in_time: e.target.value } : p)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                      placeholder="16:00" />
                  </div>
                  <div>
                    <label className="block font-body text-sm font-medium text-foreground mb-1">Check-out Time</label>
                    <input value={settings.check_out_time || ""} onChange={e => setSettings(p => p ? { ...p, check_out_time: e.target.value } : p)}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
                      placeholder="11:00" />
                  </div>
                </div>

                {/* Editable ratings shown publicly on the About section */}
                <div className="pt-2 border-t border-border">
                  <p className="font-body text-sm font-semibold text-foreground mb-1">Public Ratings</p>
                  <p className="text-xs text-muted-foreground font-body mb-3">Shown on the About section of your website.</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-body text-xs font-medium text-foreground mb-1">Star Rating</label>
                      <input type="number" min={1} max={5} step={1}
                        value={settings.star_rating ?? 0}
                        onChange={e => setSettings(p => p ? { ...p, star_rating: Number(e.target.value) } : p)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-body text-xs font-medium text-foreground mb-1">Review Score</label>
                      <input type="number" min={0} max={5} step={0.1}
                        value={settings.review_score ?? 0}
                        onChange={e => setSettings(p => p ? { ...p, review_score: Number(e.target.value) } : p)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                    </div>
                    <div>
                      <label className="block font-body text-xs font-medium text-foreground mb-1"># of Reviews</label>
                      <input type="number" min={0} step={1}
                        value={settings.review_count ?? 0}
                        onChange={e => setSettings(p => p ? { ...p, review_count: Number(e.target.value) } : p)}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background font-body text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none" />
                    </div>
                  </div>
                </div>

                <button onClick={handleSaveSettings} className="gold-gradient px-5 py-2 rounded-md font-body text-sm font-medium text-primary-foreground hover:opacity-90">
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
