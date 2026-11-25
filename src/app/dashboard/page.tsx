"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  CreditCard,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  ExternalLink,
  Shield,
  Clock,
  Sparkles,
} from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  role: string;
  lineUserId: string | null;
}

interface ReminderItem {
  id: string;
  title: string;
  category: string;
  amount: number | null;
  cycleStartDate: number | null;
  cycleEndDate: number | null;
  dueDate: string;
  notifyDaysBefore: number;
  isRecurring: boolean;
  isActive: boolean;
  lastNotifiedAt: string | null;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("CREDIT_CARD");
  const [amount, setAmount] = useState("");
  const [cycleStartDate, setCycleStartDate] = useState("");
  const [cycleEndDate, setCycleEndDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notifyDaysBefore, setNotifyDaysBefore] = useState("3");
  const [isRecurring, setIsRecurring] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = async () => {
    try {
      // 1. Fetch Current User
      const userRes = await fetch("/api/auth/me");
      if (!userRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      // 2. Fetch User's Reminders
      const remRes = await fetch("/api/reminders");
      if (remRes.ok) {
        const remData = await remRes.json();
        setReminders(remData.reminders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const handleAddReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim() || !dueDate) {
      setFormError("กรุณากรอกชื่อรายการและวันครบกำหนดชำระ");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          amount: amount ? parseFloat(amount) : null,
          cycleStartDate: cycleStartDate ? parseInt(cycleStartDate, 10) : null,
          cycleEndDate: cycleEndDate ? parseInt(cycleEndDate, 10) : null,
          dueDate,
          notifyDaysBefore: parseInt(notifyDaysBefore, 10),
          isRecurring,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "ไม่สามารถเพิ่มรายการได้");
      }

      // Reset Form & Refetch
      setTitle("");
      setAmount("");
      setCycleStartDate("");
      setCycleEndDate("");
      setDueDate("");
      setShowAddModal(false);
      await fetchData();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/reminders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDaysLeft = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dueDateStr);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-line-green border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">กำลังโหลดข้อมูล Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-12">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-line-green text-white flex items-center justify-center shadow-sm">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg">My Dashboard</span>
              <span className="text-xs text-slate-400 block -mt-0.5">
                ยินดีต้อนรับ, <strong className="text-slate-700">{user?.username}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold hover:bg-amber-100 transition flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" /> แผงผู้ดูแลระบบ
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
              title="ออกจากระบบ"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* LINE Connection Banner */}
        {user?.lineUserId ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-line-green text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  เชื่อมต่อกับ LINE เรียบร้อยแล้ว! 🔔
                </h4>
                <p className="text-xs text-emerald-700">
                  ระบบพร้อมส่งการแจ้งเตือนบิลและบัตรเครดิตเข้าแชท LINE ของคุณอัตโนมัติ
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-300">
              ID Linked
            </span>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-950 text-base">
                    ยังไม่ได้เชื่อมต่อกับ LINE Official Account
                  </h4>
                  <p className="text-xs text-amber-800 mt-1 max-w-xl leading-relaxed">
                    เพื่อให้ระบบสามารถแจ้งเตือนบัตรเครดิตและบิลต่างๆ ได้ ให้ทำตาม 2 ขั้นตอนนี้:
                  </p>
                  <ol className="text-xs text-amber-900 font-medium list-decimal list-inside mt-1.5 space-y-0.5">
                    <li>
                      เพิ่มเพื่อน LINE Bot ของระบบ{" "}
                      <span className="font-bold text-slate-800 underline">
                        {process.env.NEXT_PUBLIC_LINE_BOT_ID || "@yourbot"}
                      </span>
                    </li>
                    <li>
                      พิมพ์ชื่อผู้ใช้ของคุณ:{" "}
                      <span className="px-2 py-0.5 bg-amber-200/80 rounded font-mono font-bold text-amber-950">
                        {user?.username}
                      </span>{" "}
                      ส่งไปในแชท
                    </li>
                  </ol>
                </div>
              </div>

              <button
                onClick={() => fetchData()}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow shrink-0"
              >
                ตรวจสอบสถานะใหม่
              </button>
            </div>
          </div>
        )}

        {/* Dashboard Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">รายการแจ้งเตือนของคุณ</h2>
            <p className="text-xs text-slate-500">
              รวม {reminders.length} รายการ (ข้อมูลส่วนตัวของคุณเท่านั้น)
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-line-green hover:bg-line-hover text-white text-sm font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> เพิ่มรายการแจ้งเตือน
          </button>
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-800 text-base mb-1">ยังไม่มีรายการเตือนความจำ</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              เพิ่มรอบบิลบัตรเครดิต ค่าไฟ ค่าน้ำ หรือค่าใช้จ่ายที่ต้องจ่าย เพื่อให้ระบบเตือนคุณทาง LINE
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-line-green hover:bg-line-hover text-white text-xs font-semibold rounded-xl transition"
            >
              + เพิ่มรายการแรกเลย
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.map((item) => {
              const daysLeft = calculateDaysLeft(item.dueDate);
              const isUrgent = daysLeft <= 1 && daysLeft >= 0;
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        {item.category === "CREDIT_CARD"
                          ? "💳 บัตรเครดิต"
                          : item.category === "BILL"
                          ? "📄 บิลค่าใช้จ่าย"
                          : "📌 ทั่วไป"}
                      </span>

                      {/* Status Badge */}
                      {isOverdue ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                          เลยกำหนดแล้ว
                        </span>
                      ) : isUrgent ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                          {daysLeft === 0 ? "🚨 ครบกำหนดวันนี้!" : "⚠️ พรุ่งนี้ครบกำหนด!"}
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          อีก {daysLeft} วัน
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-1">{item.title}</h3>

                    {item.amount && (
                      <div className="text-lg font-extrabold text-slate-800 mb-2">
                        ฿{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100">
                      {item.cycleStartDate && item.cycleEndDate && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">รอบบิล:</span>
                          <span className="font-medium text-slate-700">
                            วันที่ {item.cycleStartDate} - {item.cycleEndDate}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-400">ครบกำหนด:</span>
                        <span className="font-bold text-slate-800">
                          {new Date(item.dueDate).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">เตือนล่วงหน้า:</span>
                        <span className="font-medium text-slate-700">
                          {item.notifyDaysBefore} วัน
                        </span>
                      </div>
                      {item.isRecurring && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                          <Sparkles className="w-3 h-3" /> ต่อรอบบิลใหม่อัตโนมัติทุกเดือน
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      {item.lastNotifiedAt
                        ? `เตือนล่าสุด: ${new Date(item.lastNotifiedAt).toLocaleDateString("th-TH")}`
                        : "ยังไม่เคยส่งเตือน"}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="ลบรายการนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg">เพิ่มรายการแจ้งเตือนใหม่</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-semibold"
              >
                ✕ ปิด
              </button>
            </div>

            <form onSubmit={handleAddReminder} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  ชื่อรายการ / ชื่อบัตร *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น บัตรเครดิต KBank, ค่าเน็ตบ้าน 3BB"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    ประเภทรายการ
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-line-green"
                  >
                    <option value="CREDIT_CARD">💳 บัตรเครดิต</option>
                    <option value="BILL">📄 ค่าน้ำ/ค่าไฟ/บิล</option>
                    <option value="GENERAL">📌 เตือนความจำทั่วไป</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    ยอดเงิน (บาท)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="เช่น 4500 (ไม่ใส่ก็ได้)"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-line-green focus:bg-white"
                  />
                </div>
              </div>

              {/* Cycle fields for Credit Card */}
              {category === "CREDIT_CARD" && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      วันเริ่มรอบบิล (วันที่ 1-31)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={cycleStartDate}
                      onChange={(e) => setCycleStartDate(e.target.value)}
                      placeholder="เช่น 20"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      วันตัดรอบบิล (วันที่ 1-31)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={cycleEndDate}
                      onChange={(e) => setCycleEndDate(e.target.value)}
                      placeholder="เช่น 19"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    วันครบกำหนดชำระ *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-line-green"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    แจ้งเตือนล่วงหน้า
                  </label>
                  <select
                    value={notifyDaysBefore}
                    onChange={(e) => setNotifyDaysBefore(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-line-green"
                  >
                    <option value="1">ล่วงหน้า 1 วัน</option>
                    <option value="2">ล่วงหน้า 2 วัน</option>
                    <option value="3">ล่วงหน้า 3 วัน</option>
                    <option value="5">ล่วงหน้า 5 วัน</option>
                    <option value="7">ล่วงหน้า 7 วัน</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="w-4 h-4 rounded text-line-green focus:ring-line-green border-slate-300"
                />
                <label htmlFor="recurring" className="text-xs text-slate-700 font-medium">
                  เป็นรอบบิลประจำทุกเดือน (ระบบจะเลื่อนรอบให้อัตโนมัติในเดือนถัดไป)
                </label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-line-green hover:bg-line-hover disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl transition shadow"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึกรายการ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
