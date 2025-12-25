import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contract Automation System",
  description: "Sedes rental contract automation and analysis platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
