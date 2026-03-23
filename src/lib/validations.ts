import { z } from 'zod';

export const bookingSchema = z.object({
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen haben').max(100).trim(),
  email: z.string().email('Ungültige E-Mail-Adresse').max(255).trim().toLowerCase(),
  telefon: z.string().max(30).trim().optional(),
  reisedatum_von: z.string().refine(val => !isNaN(Date.parse(val)), 'Ungültiges Datum'),
  reisedatum_bis: z.string().refine(val => !isNaN(Date.parse(val)), 'Ungültiges Datum'),
  personen: z.number().int().min(1).max(50),
  paket: z.string().max(100).trim().optional(),
  nachricht: z.string().max(5000).trim().optional(),
}).refine(data => new Date(data.reisedatum_von) < new Date(data.reisedatum_bis), {
  message: 'Anreisedatum muss vor Abreisedatum liegen',
  path: ['reisedatum_bis'],
}).refine(data => new Date(data.reisedatum_von) >= new Date(new Date().toDateString()), {
  message: 'Anreisedatum kann nicht in der Vergangenheit liegen',
  path: ['reisedatum_von'],
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Ime mora imati najmanje 2 znaka').max(100).trim(),
  email: z.string().email('Nevažeća e-mail adresa').max(255).trim().toLowerCase(),
  ulica: z.string().max(200).trim().optional(),
  postanskiBroj: z.string().max(20).trim().optional(),
  grad: z.string().max(100).trim().optional(),
  drzava: z.string().max(100).trim().optional(),
  nachricht: z.string().min(10, 'Poruka mora imati najmanje 10 znakova').max(5000).trim(),
});

// Sanitize input against XSS
export function sanitize(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\0/g, '');
}
