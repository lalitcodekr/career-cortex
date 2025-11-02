import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CareerCortex - AI Career Coach",
  description:
    "CareerCortex is your AI-powered career coach, helping you navigate your professional journey with personalized insights and guidance.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark, // 🔒 force dark theme for Clerk
        variables: {
          colorPrimary: "#6366f1", // optional (tailwind indigo-500 for accent)
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false} // 🚫 ignore system preference
            disableTransitionOnChange
          >
            {/* Header */}
            <Header />

            {/* Padding to push content below the header */}
            <main className="min-h-screen pt-20">{children}</main>

            <Toaster richColors />

            {/* Footer */}
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
