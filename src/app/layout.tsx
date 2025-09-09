import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { PostHogProvider } from "@/components/providers/PostHogProvider";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: "--font-inter",
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "LearnBridgeEdu | AI-Powered Learning for Ghana's SBC",
  description:
    "The AI-driven platform for Ghanaian teachers and students to master the Standards-Based Curriculum.",
  icons: {
    icon: "/favicon-32x32.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${dmSerifDisplay.variable} bg-slate-50 font-sans text-slate-800`}
        suppressHydrationWarning={true}
      >
        <PostHogProvider>
          {children}
        </PostHogProvider>
      </body>
    </html>
  );
}
