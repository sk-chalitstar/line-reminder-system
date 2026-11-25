import Link from "next/link";
import { Bell, CreditCard, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-line-green flex items-center justify-center text-white shadow-sm font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">
              LINE <span className="text-line-green">Reminder</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-medium bg-line-green text-white rounded-lg hover:bg-line-hover transition shadow-sm"
            >
              ลงทะเบียนฟรี
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          ระบบแจ้งเตือนรอบบิลและบัตรเครดิตผ่าน LINE อัตโนมัติ
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl">
          ไม่พลาดทุกรอบบิล และวันครบกำหนดชำระ <span className="text-line-green">แจ้งตรงเข้า LINE</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          จัดการบัตรเครดิต ค่าน้ำ ค่าไฟ และบิลประจำเดือน กำหนดวันตัดรอบและวันครบชำระ พร้อมเลือกแจ้งเตือนล่วงหน้าได้ตามต้องการ เชื่อมต่อง่ายๆ เพียงพิมพ์ชื่อใน LINE
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          <Link
            href="/register"
            className="px-8 py-3.5 bg-line-green text-white font-semibold rounded-xl hover:bg-line-hover transition shadow-md shadow-emerald-200 text-center"
          >
            เริ่มต้นใช้งาน (ด้วย PIN 4 หลัก)
          </Link>
          <Link
            href="/login"
            className="px-8 py-3.5 bg-white border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 transition text-center"
          >
            เข้าสู่ระบบด้วยชื่อและ PIN
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">เตือนรอบบิลบัตรเครดิต</h3>
            <p className="text-slate-600 text-sm">
              ระบุวันเริ่มรอบ วันตัดรอบบิล และวันครบกำหนดชำระจริง พร้อมตั้งเตือนล่วงหน้า 1-7 วันได้ตามใจ
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">เชื่อม LINE ง่ายใน 1 ขั้นตอน</h3>
            <p className="text-slate-600 text-sm">
              เพียงเพิ่มเพื่อน LINE Bot แล้วพิมพ์ชื่อตัวเองในแชท ระบบจะจดจำและส่งการ์ดแจ้งเตือนหาคุณทันที
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-lg mb-2">ปลอดภัย & ข้อมูลส่วนตัว</h3>
            <p className="text-slate-600 text-sm">
              ล็อกอินง่ายด้วย PIN 4 หลัก แยกข้อมูลผู้ใช้เป็นอิสระ มีระบบ Admin ดูแลลบข้อมูลที่ไม่ใช้แล้ว
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 bg-white">
        © 2026 LINE Reminder App. Ready for GitHub & Cloud Deployment.
      </footer>
    </div>
  );
}
