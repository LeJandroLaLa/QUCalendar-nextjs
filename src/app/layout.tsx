import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "QU Calendar",
  description: "LGBTQ+ community event platform for Cincinnati and Northern Kentucky",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}