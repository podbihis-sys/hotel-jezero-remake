import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Hotel Jezero | Premium Hotel | Kupres, BiH",
    description: "Hotel Jezero u Kupresu — 82 ležaja, restoran s 200 mjesta, sauna, bazen, teretana.",
    openGraph: {
      title: "Hotel Jezero | Premium Hotel | Kupres, BiH",
      description: "Hotel Jezero u Kupresu — 82 ležaja, restoran s 200 mjesta, sauna, bazen, teretana.",
      type: "website",
      siteName: "Hotel Jezero",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <NextIntlClientProvider messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
}
