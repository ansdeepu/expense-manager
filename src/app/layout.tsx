
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ClientProviders } from "@/components/client-providers";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "FinBudgetManager",
  description: "Manage your expenses with ease and get AI-powered insights.",
  icons: {
    icon: [
      { url: "/app-icon.png" },
      { url: "/app-icon.png", sizes: "16x16", type: "image/png" },
      { url: "/app-icon.png", sizes: "32x32", type: "image/png" },
      { url: "/app-icon.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/app-icon.png",
    apple: [
      { url: "/app-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FinBudgetManager",
  },
  formatDetection: {
    telephone: false,
  },
};

import { ServiceWorkerRegistration } from "@/components/pwa-registration";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.className} h-screen`}>
      <body className="antialiased h-screen">
        <ClientProviders>
          <ServiceWorkerRegistration />
          {children}
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
