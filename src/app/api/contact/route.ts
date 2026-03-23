import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { contactSchema, sanitize } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { sendContactMail } from "@/lib/mailer";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const { success, remaining } = await rateLimit(`contact:${ip}`, 3, 60 * 60 * 1000);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Previše zahtjeva. Pokušajte ponovo kasnije." },
        { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
      );
    }

    const body = await request.json();

    // Anti-spam: honeypot — bot filled the hidden field
    if (body._hp) {
      return NextResponse.json({ success: true, message: "Vaša poruka je uspješno poslana!" });
    }

    // Anti-spam: form submitted too fast (< 3 seconds)
    if (body._t && Date.now() - Number(body._t) < 3000) {
      return NextResponse.json({ success: true, message: "Vaša poruka je uspješno poslana!" });
    }

    const { _hp, _t, ...formData } = body;
    void _hp; void _t;

    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: "Greška u validaciji.", errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const sanitized = {
      name: sanitize(result.data.name),
      email: result.data.email,
      nachricht: sanitize(result.data.nachricht),
    };

    const supabase = createServerClient();
    const { error } = await supabase.from("contact_messages").insert(sanitized);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { success: false, message: "Greška pri slanju poruke." },
        { status: 500 }
      );
    }

    // Send email notification (fire-and-forget, don't block response)
    try {
      await sendContactMail({
        name: sanitized.name,
        email: sanitized.email,
        nachricht: sanitized.nachricht,
        ulica: result.data.ulica ? sanitize(result.data.ulica) : undefined,
        postanskiBroj: result.data.postanskiBroj ? sanitize(result.data.postanskiBroj) : undefined,
        grad: result.data.grad ? sanitize(result.data.grad) : undefined,
        drzava: result.data.drzava ? sanitize(result.data.drzava) : undefined,
      });
    } catch (mailErr) {
      console.error("Mail send error:", mailErr);
    }

    return NextResponse.json(
      { success: true, message: "Vaša poruka je uspješno poslana!" },
      { status: 201, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Neočekivana greška." },
      { status: 500 }
    );
  }
}
