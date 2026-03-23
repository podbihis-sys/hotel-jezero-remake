export interface Event {
  slug: string;
  title: string;
  date: string;
  image: string;
  summary: string;
  body: string;
  contact?: string;
  pinned?: boolean;
}

export const events: Event[] = [
  {
    slug: "docek-nove-godine-2026",
    title: "Doček Nove godine 2026",
    date: "31. prosinac 2025.",
    image: "/images/hotel-jezero10.jpg",
    summary: "Proslavite Novu godinu u Hotelu Jezero! Gala večera, živa muzika i nezaboravna atmosfera.",
    body: `Pridružite nam se za nezaboravan doček Nove godine u Hotelu Jezero!

Gala večera uključuje bogat meni domaće i internacionalne kuhinje, živa muzika i zabava do ranih jutarnjih sati.

Cijena gala večere: 120 KM po osobi (djeca do 6 godina besplatno, 6-14 godina 40% popusta).

Minimalni boravak: 3 noćenja.

Rezervirajte na vrijeme!`,
    pinned: true,
  },
  {
    slug: "ljetna-sezona-2026",
    title: "Ljetna sezona 2026",
    date: "1. lipanj 2026.",
    image: "/images/hotel-jezero3.jpg",
    summary: "Otvaramo ljetnu sezonu! Uživajte u prirodi, bazenu, sauni i rekreaciji na Kupresu.",
    body: `Hotel Jezero vas poziva na ljetnu sezonu 2026!

Uživajte u predivnoj prirodi Kupresa, bazenu, sauni, teretani i brojnim aktivnostima na otvorenom.

Posebne ljetne cijene za obitelji i duži boravak.

Kontaktirajte nas za rezervacije.`,
    pinned: false,
  },
];

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((e) => e.slug === slug);
}
