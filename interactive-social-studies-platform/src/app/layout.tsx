import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "تقويم الوحدة الثالثة | مدرسة العروس الابتدائية",
  description: "تقويم تفاعلي للوحدة الثالثة: الدولة السعودية الثانية — الدراسات الاجتماعية للصف السادس الابتدائي.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="ar" dir="rtl"><body>{children}</body></html>;
}
