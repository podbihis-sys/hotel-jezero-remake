import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { bookingSchema, sanitize } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { sendBookingMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { success, remaining } = await rateLimit(`booking:${ip}`, 5, 60 * 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Previše zahtjeva. Pokušajte ponovo kasnije." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();

    // Anti-spam: honeypot
    if (body._hp) {
      return NextResponse.json({ success: true, message: "Vaša rezervacija je uspješno poslana!" });
    }

    // Anti-spam: form submitted too fast (< 3 seconds)
    if (body._t && Date.now() - Number(body._t) < 3000) {
      return NextResponse.json({ success: true, message: "Vaša rezervacija je uspješno poslana!" });
    }

    const { _hp, _t, ...formData } = body;
    void _hp; void _t;

    const result = bookingSchema.safeParse(formData);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Greška u validaciji.", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const sanitized = {
      ...result.data,
      name: sanitize(result.data.name),
      email: result.data.email,
      telefon: result.data.telefon ? sanitize(result.data.telefon) : null,
      paket: result.data.paket ? sanitize(result.data.paket) : null,
      nachricht: result.data.nachricht ? sanitize(result.data.nachricht) : null,
    };

    const supabase = createServerClient();
    const { error } = await supabase.from("bookings").insert(sanitized);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Greška pri spremanju rezervacije." },
        { status: 500 }
      );
    }

    // Send email notification
    try {
      await sendBookingMail(sanitized);
    } catch (mailErr) {
      console.error("Mail send error:", mailErr);
    }

    return NextResponse.json(
      { success: true, message: "Vaša rezervacija je uspješno poslana!" },
      { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Neočekivana greška." },
      { status: 500 }
    );
  }
}
