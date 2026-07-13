import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";
import { SessionSync } from "@/components/store/session-sync";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Amrut Collection — Premium Indian Clothing | Parola, Jalgaon",
  description:
    "Amrut Collection — a premium clothing reselling brand from Parola, Jalgaon. Shop men, women & kids ethnic and casual wear with a luxury Indian shopping experience.",
  keywords: [
    "Amrut Collection",
    "Indian clothing",
    "premium fashion",
    "ethnic wear",
    "sarees",
    "kurtis",
    "Parola",
    "Jalgaon",
    "Maharashtra",
  ],
  authors: [{ name: "Amrut Collection" }],
  openGraph: {
    title: "Amrut Collection — Premium Indian Clothing",
    description: "Luxury Indian fashion shopping experience from Parola, Jalgaon.",
    siteName: "Amrut Collection",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${playfair.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <SessionSync />
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
