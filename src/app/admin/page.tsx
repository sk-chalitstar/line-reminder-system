"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Users,
  Trash2,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  RefreshCw,
  Search,
} from "lucide-react";

interface AdminUserItem {
  id: string;
  username: string;
  role: string;
  lineUserId: string | null;
  createdAt: string;
  _count: {
    reminders: number;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [cleaning, setCleaning] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
          router.push("/dashboard");
          return;
        }
        throw new Error("Failed to load users");
      }
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string, username: string) => {
    if (
      !confirm(
        `⚠️ คำเตือน: คุณต้องการลบผู้ใช้ "${username}" และรายการเตือนความจำทั้งหมดของคนนี้จริงหรือไม่? ข้อมูลจะไม่สามารถกู้คืนได้!`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "ไม่สามารถลบผู้ใช้ได้");
        return;
      }

      setActionMessage(data.message);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
  };

  const handleCleanStaleData = async () => {
    if (
      !confirm(
        "คุณต้องการล้างข้อมูลการแจ้งเตือนเก่าที่เลยกำหนดชำระเกิน 30 วันและไม่ใช่บิลประจำใช่หรือไม่?"
      )
    ) {
      return;
    }

    setCleaning(true);
    try {
      const res = await fetch("/api/admin/reminders/stale?days=30", {
        method: "DELETE",
      });
      const data = await res.json();
      setActionMessage(data.message);
      setTimeout(() => setActionMessage(""), 5000);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    } finally {
      setCleaning(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">กำลังตรวจสอบสิทธิ์ Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/60 pb-12">
      {/* Admin Navbar */}
      <header className="bg-slate-900 text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-lg">Admin Console</span>
              <span className="text-xs text-slate-400 block -mt-0.5">
                จัดการผู้ใช้และทำความสะอาดระบบ
              </span>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> กลับหน้า Dashboard ของฉัน
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {actionMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">ผู้ใช้งานทั้งหมด</span>
              <span className="text-2xl font-bold text-slate-800">{users.length} คน</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-500 block">เชื่อมต่อ LINE แล้ว</span>
              <span className="text-2xl font-bold text-slate-800">
                {users.filter((u) => u.lineUserId).length} คน
              </span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">ทำความสะอาดข้อมูล</span>
              <span className="text-xs text-slate-400">ลบบิลเก่าเกิน 30 วัน</span>
            </div>
            <button
              onClick={handleCleanStaleData}
              disabled={cleaning}
              className="px-3.5 py-2 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              {cleaning ? "กำลังล้าง..." : "ล้างข้อมูลเก่า"}
            </button>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">รายชื่อผู้ใช้ในระบบ</h3>
              <p className="text-xs text-slate-500">
                สามารถตรวจสอบสถานะการผูก LINE และลบ User ที่ไม่ใช้งานได้
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อผู้ใช้..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-line-green"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">ชื่อผู้ใช้ (Username)</th>
                  <th className="py-3 px-4">สถานะ LINE</th>
                  <th className="py-3 px-4">สิทธิ์ (Role)</th>
                  <th className="py-3 px-4">จำนวนรายการเตือน</th>
                  <th className="py-3 px-4">วันที่สมัคร</th>
                  <th className="py-3 px-4 text-end">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่พบข้อมูลผู้ใช้
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.username}
                      </td>
                      <td className="py-3.5 px-4">
                        {item.lineUserId ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> เชื่อมต่อแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> ยังไม่ผูก LINE
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            item.role === "ADMIN"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {item._count.reminders} รายการ
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString("th-TH")}
                      </td>
                      <td className="py-3.5 px-4 text-end">
                        {item.role !== "ADMIN" && (
                          <button
                            onClick={() => handleDeleteUser(item.id, item.username)}
                            className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                            title="ลบ User และข้อมูลทั้งหมด"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> ลบ User
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
