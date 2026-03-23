import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.ionos.de",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ContactMailOptions {
  name: string;
  email: string;
  nachricht: string;
  ulica?: string;
  postanskiBroj?: string;
  grad?: string;
  drzava?: string;
}

interface BookingMailOptions {
  name: string;
  email: string;
  telefon?: string | null;
  reisedatum_von: string;
  reisedatum_bis: string;
  personen: number;
  paket?: string | null;
  nachricht?: string | null;
}

export async function sendContactMail(data: ContactMailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured — skipping email");
    return;
  }

  const addressLines = [data.ulica, [data.postanskiBroj, data.grad].filter(Boolean).join(" "), data.drzava]
    .filter(Boolean)
    .join(", ");

  await transporter.sendMail({
    from: `"Hotel Jezero Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    replyTo: data.email,
    subject: `Nova poruka: ${data.name}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#163c6f;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">Nova kontakt poruka</h1>
        </div>
        <div style="padding:24px;background:#f8f9fa;border:1px solid #e5e7eb">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;width:120px">Ime:</td><td style="padding:8px 0;color:#1f2937;font-weight:600">${data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">E-Mail:</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#00c0f7">${data.email}</a></td></tr>
            ${addressLines ? `<tr><td style="padding:8px 0;color:#6b7280">Adresa:</td><td style="padding:8px 0;color:#1f2937">${addressLines}</td></tr>` : ""}
          </table>
          <div style="margin-top:16px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
            <p style="color:#6b7280;margin:0 0 8px;font-size:13px">Poruka:</p>
            <p style="color:#1f2937;margin:0;white-space:pre-wrap">${data.nachricht}</p>
          </div>
        </div>
        <div style="padding:12px;text-align:center;color:#9ca3af;font-size:12px">
          Poslano putem hotel-jezero.com kontakt forme
        </div>
      </div>
    `,
  });
}

export async function sendBookingMail(data: BookingMailOptions) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn("SMTP not configured — skipping email");
    return;
  }

  await transporter.sendMail({
    from: `"Hotel Jezero Website" <${process.env.SMTP_USER}>`,
    to: process.env.SMTP_USER,
    replyTo: data.email,
    subject: `Nova rezervacija: ${data.name} (${data.reisedatum_von} - ${data.reisedatum_bis})`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#163c6f;padding:20px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:20px">Nova rezervacija</h1>
        </div>
        <div style="padding:24px;background:#f8f9fa;border:1px solid #e5e7eb">
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#6b7280;width:140px">Ime:</td><td style="padding:8px 0;color:#1f2937;font-weight:600">${data.name}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">E-Mail:</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#00c0f7">${data.email}</a></td></tr>
            ${data.telefon ? `<tr><td style="padding:8px 0;color:#6b7280">Telefon:</td><td style="padding:8px 0;color:#1f2937">${data.telefon}</td></tr>` : ""}
            <tr><td style="padding:8px 0;color:#6b7280">Dolazak:</td><td style="padding:8px 0;color:#1f2937;font-weight:600">${data.reisedatum_von}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Odlazak:</td><td style="padding:8px 0;color:#1f2937;font-weight:600">${data.reisedatum_bis}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280">Broj osoba:</td><td style="padding:8px 0;color:#1f2937">${data.personen}</td></tr>
            ${data.paket ? `<tr><td style="padding:8px 0;color:#6b7280">Paket:</td><td style="padding:8px 0;color:#1f2937">${data.paket}</td></tr>` : ""}
          </table>
          ${data.nachricht ? `
          <div style="margin-top:16px;padding:16px;background:#fff;border-radius:8px;border:1px solid #e5e7eb">
            <p style="color:#6b7280;margin:0 0 8px;font-size:13px">Napomena:</p>
            <p style="color:#1f2937;margin:0;white-space:pre-wrap">${data.nachricht}</p>
          </div>` : ""}
        </div>
        <div style="padding:12px;text-align:center;color:#9ca3af;font-size:12px">
          Poslano putem hotel-jezero.com rezervacije
        </div>
      </div>
    `,
  });
}
