import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, DM_Serif_Display, Caveat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import { getActiveMarqueeAnnouncements, getSiteSettings } from "@/lib/db";
import { Announcement } from "@/lib/types";

const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fontDisplay = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const fontSerif = DM_Serif_Display({
  variable: "--font-serif",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const fontScript = Caveat({
  variable: "--font-script",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSiteSettings();
    return {
      title: {
        default: settings.meta_title || "NEPALI IN KIIT — Official Student Community",
        template: "%s | NEPALI IN KIIT",
      },
      description:
        settings.meta_description ||
        "The premier digital home, cultural heart, and student community for Nepali students at KIIT University, Bhubaneswar, Odisha.",
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
      openGraph: {
        title: "NEPALI IN KIIT",
        description: "Two Nations. One Community. Every Nepali in KIIT belongs here.",
        siteName: "NEPALI IN KIIT",
        locale: "en_US",
        type: "website",
      },
      icons: {
        icon: "/favicon.ico",
      },
    };
  } catch (e) {
    return {
      title: "NEPALI IN KIIT",
      description: "Nepali Student Community at KIIT University, Bhubaneswar",
    };
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let announcements: Announcement[] = [];
  try {
    announcements = await getActiveMarqueeAnnouncements();
  } catch (err) {
    console.error("Failed to load ticker announcements:", err);
  }

  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontSerif.variable} ${fontScript.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-[#17231B] selection:bg-[#0B3D2E] selection:text-white">
        <AnnouncementTicker announcements={announcements} />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
