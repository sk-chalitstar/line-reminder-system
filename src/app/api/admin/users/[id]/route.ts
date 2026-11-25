import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ลบผู้ใช้ และข้อมูลที่เกี่ยวข้องทั้งหมด (Cascade Delete)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เข้าถึง เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น" },
      { status: 403 }
    );
  }

  const { id } = params;

  // ห้ามแอดมินลบบัญชีตัวเอง
  if (user.id === id) {
    return NextResponse.json(
      { error: "ไม่สามารถลบบัญชีของตัวเองได้" },
      { status: 400 }
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "ไม่พบผู้ใช้ที่ระบุ" }, { status: 404 });
  }

  // ลบ User (ระบบจะทำการลบ Reminders ที่ผูกอยู่โดยอัตโนมัติตาม onDelete: Cascade)
  await prisma.user.delete({
    where: { id },
  });

  return NextResponse.json({
    message: `ลบผู้ใช้ ${targetUser.username} และข้อมูลทั้งหมดสำเร็จเรียบร้อย`,
  });
}
