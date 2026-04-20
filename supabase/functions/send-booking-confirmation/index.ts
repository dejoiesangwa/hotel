const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

interface BookingPayload {
  guest_name: string;
  guest_email: string;
  room_name: string;
  check_in: string;
  check_out: string;
  guests: number;
  special_requests?: string | null;
}

const renderEmail = (b: BookingPayload, hotelName: string, phone: string) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#ffffff; color:#1a1a1a;">
    <div style="background:#1a1a1a; padding: 30px 25px; text-align:center;">
      <h1 style="color:#d4af37; margin:0; font-size:24px; letter-spacing:2px;">${hotelName.toUpperCase()}</h1>
      <p style="color:#ffffff; margin:8px 0 0; font-size:13px; letter-spacing:3px;">BOOKING CONFIRMED</p>
    </div>
    <div style="padding: 30px 25px;">
      <p style="font-size:16px;">Dear ${b.guest_name},</p>
      <p style="font-size:14px; line-height:1.6; color:#444;">
        We are delighted to confirm your reservation at <strong>${hotelName}</strong>. We look forward to welcoming you.
      </p>
      <div style="background:#faf7f0; border-left:3px solid #d4af37; padding:20px; margin:25px 0; border-radius:4px;">
        <h2 style="margin:0 0 15px; font-size:16px; color:#1a1a1a;">Your Reservation</h2>
        <table style="width:100%; font-size:14px;">
          <tr><td style="padding:6px 0; color:#666;">Room:</td><td style="padding:6px 0; font-weight:600;">${b.room_name}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Check-in:</td><td style="padding:6px 0; font-weight:600;">${b.check_in}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Check-out:</td><td style="padding:6px 0; font-weight:600;">${b.check_out}</td></tr>
          <tr><td style="padding:6px 0; color:#666;">Guests:</td><td style="padding:6px 0; font-weight:600;">${b.guests}</td></tr>
          ${b.special_requests ? `<tr><td style="padding:6px 0; color:#666; vertical-align:top;">Notes:</td><td style="padding:6px 0;">${b.special_requests}</td></tr>` : ""}
        </table>
      </div>
      <p style="font-size:14px; line-height:1.6; color:#444;">
        Our reception will contact you shortly regarding payment details. If you have any questions, feel free to reach us at <strong>${phone}</strong>.
      </p>
      <p style="font-size:14px; margin-top:25px;">Warm regards,<br/><strong>The ${hotelName} Team</strong></p>
    </div>
    <div style="background:#f5f5f5; padding:15px; text-align:center; font-size:12px; color:#888;">
      This is an automated confirmation. Please do not reply to this email.
    </div>
  </div>
`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured");

    const { booking, hotel_name, phone, reception_email } = await req.json();

    if (!booking?.guest_email || !booking?.guest_name) {
      return new Response(JSON.stringify({ error: "Missing booking fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const hotelName = hotel_name || "Silver Hotel Kigali";
    const html = renderEmail(booking, hotelName, phone || "");

    // Build recipient list: guest + reception (if configured)
    const recipients = [booking.guest_email];
    if (reception_email && reception_email !== booking.guest_email) {
      recipients.push(reception_email);
    }

    const sendEmail = async (to: string[], subject: string, htmlBody: string) => {
      const r = await fetch(`${GATEWAY_URL}/emails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "X-Connection-Api-Key": RESEND_API_KEY,
        },
        body: JSON.stringify({
          from: `${hotelName} <onboarding@resend.dev>`,
          to,
          subject,
          html: htmlBody,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        console.error("Resend error:", d);
        throw new Error(`Resend API error [${r.status}]: ${JSON.stringify(d)}`);
      }
      return d;
    };

    // 1. Send confirmation to guest
    const guestData = await sendEmail(
      [booking.guest_email],
      `Booking Confirmed — ${booking.room_name}`,
      html,
    );

    // 2. Send notification to reception (if configured)
    if (reception_email && reception_email !== booking.guest_email) {
      const receptionHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background:#ffffff; color:#1a1a1a;">
          <div style="background:#1a1a1a; padding: 24px; text-align:center;">
            <h1 style="color:#d4af37; margin:0; font-size:20px; letter-spacing:2px;">NEW BOOKING REQUEST</h1>
            <p style="color:#ffffff; margin:6px 0 0; font-size:12px; letter-spacing:2px;">${hotelName.toUpperCase()}</p>
          </div>
          <div style="padding: 25px;">
            <p style="font-size:15px;">A new booking request has been received.</p>
            <div style="background:#faf7f0; border-left:3px solid #d4af37; padding:18px; margin:20px 0; border-radius:4px;">
              <table style="width:100%; font-size:14px;">
                <tr><td style="padding:5px 0; color:#666;">Guest:</td><td style="padding:5px 0; font-weight:600;">${booking.guest_name}</td></tr>
                <tr><td style="padding:5px 0; color:#666;">Email:</td><td style="padding:5px 0; font-weight:600;">${booking.guest_email}</td></tr>
                ${booking.guest_phone ? `<tr><td style="padding:5px 0; color:#666;">Phone:</td><td style="padding:5px 0; font-weight:600;">${booking.guest_phone}</td></tr>` : ""}
                <tr><td style="padding:5px 0; color:#666;">Room:</td><td style="padding:5px 0; font-weight:600;">${booking.room_name}</td></tr>
                <tr><td style="padding:5px 0; color:#666;">Check-in:</td><td style="padding:5px 0; font-weight:600;">${booking.check_in}</td></tr>
                <tr><td style="padding:5px 0; color:#666;">Check-out:</td><td style="padding:5px 0; font-weight:600;">${booking.check_out}</td></tr>
                <tr><td style="padding:5px 0; color:#666;">Guests:</td><td style="padding:5px 0; font-weight:600;">${booking.guests}</td></tr>
                ${booking.special_requests ? `<tr><td style="padding:5px 0; color:#666; vertical-align:top;">Notes:</td><td style="padding:5px 0;">${booking.special_requests}</td></tr>` : ""}
              </table>
            </div>
            <p style="font-size:13px; color:#666;">Please contact the guest to confirm availability and payment.</p>
          </div>
        </div>
      `;
      try {
        await sendEmail(
          [reception_email],
          `🔔 New Booking — ${booking.guest_name} (${booking.room_name})`,
          receptionHtml,
        );
      } catch (e) {
        console.error("Failed to notify reception:", e);
      }
    }

    return new Response(JSON.stringify({ success: true, id: guestData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("send-booking-confirmation error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
