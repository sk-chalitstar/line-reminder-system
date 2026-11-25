import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ดึงรายชื่อผู้ใช้ทั้งหมดสำหรับ Admin
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เข้าถึง เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น" },
      { status: 403 }
    );
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      role: true,
      lineUserId: true,
      createdAt: true,
      _count: {
        select: { reminders: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ users });
}
