import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// เคลียร์ข้อมูลแจ้งเตือนเก่าที่เลยกำหนดชำระไปแล้ว
export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เข้าถึง เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const daysAgo = parseInt(searchParams.get("days") || "30", 10);

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

  const deleted = await prisma.reminder.deleteMany({
    where: {
      dueDate: { lt: cutoffDate },
      isRecurring: false, // ลบเฉพาะอันที่ไม่ใช่บิลประจำทุกเดือน
    },
  });

  return NextResponse.json({
    message: `ลบข้อมูลที่หมดอายุเกิน ${daysAgo} วันไปแล้วจำนวน ${deleted.count} รายการ`,
    count: deleted.count,
  });
}
