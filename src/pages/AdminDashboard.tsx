import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogOut, Hotel, BedDouble, CalendarDays, Settings, Plus, Pencil, Trash2, Check, X, Users, Eye } from "lucide-react";
import type { Session } from "@supabase/supabase-js";

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
};

const tabs = [
  { id: "rooms", label: "Rooms", icon: BedDouble },
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"rooms" | "bookings" | "settings">("bookings");

  // Rooms state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [roomImageFile, setRoomImageFile] = useState<File | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Settings state
  const [settings, setSettings] = useState<HotelSettings | null>(null);

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
    await supabase.from("bookings").update({ status }).eq("id", id);
    toast.success(`Booking ${status}`);
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
    }).eq("id", settings.id);
    if (error) toast.error(error.message);
    else toast.success("Settings saved!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><p className="text-muted-foreground">Loading...</p></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-warm-dark border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hotel className="w-5 h-5 text-gold" />
          <span className="font-heading text-lg text-primary-foreground font-semibold">Silver Hotel — Reception</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-primary-foreground/60 hover:text-primary-foreground text-sm font-body flex items-center gap-1">
            <Eye className="w-4 h-4" /> View Website
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
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 max-w-5xl">
          {/* BOOKINGS TAB */}
          {tab === "bookings" && (
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-4">Booking Requests</h2>
              {bookings.length === 0 ? (
                <p className="text-muted-foreground font-body">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-body font-semibold text-foreground">{b.guest_name}</p>
                          <p className="font-body text-sm text-muted-foreground">{b.guest_email} {b.guest_phone && `• ${b.guest_phone}`}</p>
                        </div>
                        <span className={`text-xs font-body font-medium px-2.5 py-1 rounded-full ${b.status === "confirmed" ? "bg-green-100 text-green-800" : b.status === "declined" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm font-body text-muted-foreground mb-2">
                        <span>🛏️ {b.room_name}</span>
                        <span>📅 {b.check_in} → {b.check_out}</span>
                        <span>👥 {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                      </div>
                      {b.special_requests && <p className="text-sm font-body text-muted-foreground italic mb-2">"{b.special_requests}"</p>}
                      {b.status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleBookingStatus(b.id, "confirmed")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-body hover:bg-green-700">
                            <Check className="w-3 h-3" /> Confirm
                          </button>
                          <button onClick={() => handleBookingStatus(b.id, "declined")}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-md text-xs font-body hover:bg-red-700">
                            <X className="w-3 h-3" /> Decline
                          </button>
                        </div>
                      )}
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

              {/* Room Edit Form */}
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
                      <label className="block font-body text-sm font-medium text-foreground mb-1">Price per Night (RF) *</label>
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

              {/* Room List */}
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
                        <span>💰 RF {room.price.toLocaleString()}/night</span>
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
                  <label className="block font-body text-sm font-medium text-foreground mb-1">Hotel Name</label>
                  <input value={settings.hotel_name} onChange={e => setSettings(p => p ? { ...p, hotel_name: e.target.value } : p)}
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
