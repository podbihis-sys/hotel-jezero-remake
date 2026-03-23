export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function hotelJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Hotel",
    name: "Hotel Jezero",
    description: "Premium ski & wellness resort u Kupresu, Bosna i Hercegovina.",
    url: "https://hotel-jezero.com",
    telephone: "+38734275102",
    email: "recepcija@hotel-jezero.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Malovan bb",
      addressLocality: "Kupres",
      postalCode: "80320",
      addressCountry: "BA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.95,
      longitude: 17.26,
    },
    image: "https://hotel-jezero.com/images/headerAdriaSki.jpg",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Ski Resort", value: true },
      { "@type": "LocationFeatureSpecification", name: "Indoor Pool", value: true },
      { "@type": "LocationFeatureSpecification", name: "Restaurant", value: true },
      { "@type": "LocationFeatureSpecification", name: "Fitness Center", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wedding Hall", value: true },
      { "@type": "LocationFeatureSpecification", name: "Conference Room", value: true },
    ],
    checkinTime: "14:00",
    checkoutTime: "10:00",
    numberOfRooms: 128,
  };
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Hotel Jezero",
    url: "https://hotel-jezero.com",
    telephone: "+38734275102",
    email: "recepcija@hotel-jezero.com",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Malovan bb",
      addressLocality: "Kupres",
      postalCode: "80320",
      addressCountry: "BA",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.95,
      longitude: 17.26,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "00:00",
      closes: "23:59",
    },
    image: "https://hotel-jezero.com/images/headerAdriaSki.jpg",
    priceRange: "$$",
  };
}

export function eventJsonLd(event: { title: string; date: string; image: string; summary: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.summary,
    image: `https://hotel-jezero.com${event.image}`,
    url: `https://hotel-jezero.com/hr/dogadanja/${event.slug}`,
    location: {
      "@type": "Place",
      name: "Hotel Jezero",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Malovan bb",
        addressLocality: "Kupres",
        postalCode: "80320",
        addressCountry: "BA",
      },
    },
    organizer: {
      "@type": "Organization",
      name: "Hotel Jezero",
      url: "https://hotel-jezero.com",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
