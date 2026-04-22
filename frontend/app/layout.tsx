import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "SupportDesk | Professional Ticketing System",
  description: "A full-featured IT support and customer service ticketing platform with role-based access control.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a2234',
              color: '#f1f5f9',
              border: '1px solid #2d3748',
              borderRadius: '10px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1a2234' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#1a2234' },
            },
          }}
        />
      </body>
    </html>
  );
}
