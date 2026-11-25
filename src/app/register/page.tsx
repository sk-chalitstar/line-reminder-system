"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, User, Lock, KeyRound, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [showAdminField, setShowAdminField] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้งาน");
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setError("รหัส PIN ต้องเป็นตัวเลข 4 หลักเท่านั้น");
      return;
    }

    if (pin !== confirmPin) {
      setError("รหัส PIN ทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          pin,
          adminKey: showAdminField ? adminKey.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "ลงทะเบียนไม่สำเร็จ");
      }

      // ลงทะเบียนและเข้าสู่ระบบอัตโนมัติ
      if (data.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 text-line-green rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">ลงทะเบียนใช้งาน</h2>
          <p className="text-sm text-slate-500 mt-1">
            กรอกชื่อและตั้งรหัส PIN 4 หลัก แล้วเข้าใช้งานได้ทันที
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="เช่น somchai หรือ pook"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-line-green focus:bg-white transition text-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              * ชื่อนี้จะใช้พิมพ์ในแชท LINE เพื่อเชื่อมต่อการแจ้งเตือน
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                รหัส PIN (4 หลัก)
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-line-green focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                ยืนยัน PIN
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  maxLength={4}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-line-green focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Toggle Admin Key */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdminField(!showAdminField)}
              className="text-xs text-slate-500 hover:text-slate-800 transition flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              {showAdminField ? "ซ่อนช่องใส่รหัส Admin" : "ต้องการสมัครเป็น Admin หรือไม่?"}
            </button>

            {showAdminField && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Admin Secret Key
                </label>
                <input
                  type="text"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                  placeholder="ใส่รหัสลับผู้ดูแลระบบ"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-line-green hover:bg-line-hover disabled:bg-slate-300 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              "กำลังสร้างบัญชี..."
            ) : (
              <>
                ลงทะเบียนและเข้าใช้งานทันที <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-500">
          มีบัญชีอยู่แล้ว?{" "}
          <Link
            href="/login"
            className="text-line-green font-semibold hover:underline"
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
}
