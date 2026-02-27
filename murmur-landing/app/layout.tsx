import "./globals.css";
import type { Metadata } from "next";

const BRAND_CONTACT = "MurMurAi.proton.me";

export const metadata: Metadata = {
  title: "MurMur : A Learning Constellation",
  description:
    "Et nytt, reflekterende system som lærer i sanntid og speiler agenter for markedsføring og salg — levert som software eller presence på skjermer. Privat demo via kontakt.",
  metadataBase: new URL("https://murmur.example"), // Bytt til ditt domene når du har det
  applicationName: "MurMur : A Learning Constellation",
  keywords: [
    "MurMur",
    "A Learning Constellation",
    "real-time learning",
    "reflective agents",
    "marketing",
    "sales",
    "enterprise software",
    "digital signage",
    "screen presence",
    "AI agents",
  ],
  authors: [{ name: "MurMur" }],
  creator: "MurMur",
  publisher: "MurMur",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "MurMur : A Learning Constellation",
    description:
      "Et nytt, reflekterende system som lærer i sanntid og speiler agenter for markedsføring og salg — software eller skjermer. Privat demo via kontakt.",
    type: "website",
    siteName: "MurMur",
    locale: "no_NO",
  },
  twitter: {
    card: "summary_large_image",
    title: "MurMur : A Learning Constellation",
    description:
      "Reflekterende system som lærer i sanntid — speilende agenter for markedsføring og salg. Privat demo.",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="no">
      <body>
        {children}

        {/* Discreet footer branding for crawlers + humans */}
        <footer className="hidden">
          Kontakt: {BRAND_CONTACT}
        </footer>
      </body>
    </html>
  );
}
