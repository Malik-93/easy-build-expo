import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Easy Build Expo | Dashboard",
  description: "Manage your Expo Android builds and submissions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </body>
    </html>
  );
}
