"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, User, Delete, ArrowRight, ShieldAlert } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4 && username.trim()) {
        submitLogin(username.trim(), nextPin);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const submitLogin = async (userToSubmit: string, pinToSubmit: string) => {
    if (!userToSubmit || pinToSubmit.length !== 4) {
      setError("กรุณากรอกชื่อและรหัส PIN 4 หลักให้ครบถ้วน");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userToSubmit, pin: pinToSubmit }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      // เข้าสู่ระบบสำเร็จ นำทางไปหน้า Dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setPin(""); // รีเซ็ต PIN เมื่อใส่ผิด
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-emerald-50 text-line-green rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">เข้าสู่ระบบ</h2>
          <p className="text-sm text-slate-500 mt-1">
            ใส่ชื่อและรหัสผ่าน PIN 4 หลักเพื่อเข้าใช้งาน
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Username Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            ชื่อผู้ใช้งาน (Username)
          </label>
          <div className="relative">
            <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ระบุชื่อที่ลงทะเบียนไว้"
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-line-green focus:bg-white transition text-sm font-medium"
              disabled={loading}
            />
          </div>
        </div>

        {/* PIN Indicator Dots */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 text-center">
            รหัส PIN 4 หลัก
          </label>
          <div className="flex justify-center gap-4 my-2">
            {[0, 1, 2, 3].map((index) => {
              const isFilled = pin.length > index;
              return (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-all duration-200 ${
                    isFilled
                      ? "bg-line-green scale-110 shadow-sm shadow-emerald-200"
                      : "bg-slate-200"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={loading}
              className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-xl transition flex items-center justify-center border border-slate-100 shadow-sm"
            >
              {num}
            </button>
          ))}
          <div className="h-14" /> {/* Empty spacer */}
          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={loading}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-800 font-semibold text-xl transition flex items-center justify-center border border-slate-100 shadow-sm"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading || pin.length === 0}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 active:bg-red-100 transition flex items-center justify-center border border-slate-100 shadow-sm"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        {/* Manual Submit Button */}
        <button
          onClick={() => submitLogin(username, pin)}
          disabled={loading || pin.length !== 4 || !username.trim()}
          className="w-full py-3.5 bg-line-green hover:bg-line-hover disabled:bg-slate-300 text-white font-semibold rounded-xl transition shadow-md flex items-center justify-center gap-2"
        >
          {loading ? (
            "กำลังเข้าสู่ระบบ..."
          ) : (
            <>
              เข้าใช้งานทันที <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="text-center mt-6 text-sm text-slate-500">
          ยังไม่มีบัญชีใช้งาน?{" "}
          <Link
            href="/register"
            className="text-line-green font-semibold hover:underline"
          >
            ลงทะเบียนที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
}
