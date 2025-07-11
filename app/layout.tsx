import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";
import { SidebarProvider } from "@/contexts/SidebarProvider";

export const metadata: Metadata = {
  metadataBase: new URL("https://gemini.vercel.ai"),
  title: "Odin AI",
  description: "Odin AI is a platform for learning DSA",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SidebarProvider>
          <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          >
          <Toaster position="top-center" />
          {/* <Navbar /> */}
          {children}
        </ThemeProvider>
        </SidebarProvider>
        
        
      </body>
    </html>
  );
}
