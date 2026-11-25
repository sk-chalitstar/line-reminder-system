import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LINE Reminder App - ระบบเตือนความจำและแจ้งเตือนผ่านไลน์",
  description: "ระบบจัดการรอบบิลบัตรเครดิต ค่าใช้จ่าย และแจ้งเตือนอัตโนมัติผ่าน LINE",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="antialiased min-h-screen text-slate-900 bg-slate-50 font-sans">
        {children}
      </body>
    </html>
  );
}
