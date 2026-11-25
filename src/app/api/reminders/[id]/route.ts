import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = params;

  // ตรวจสอบว่าเป็นเจ้าของรายการจริงหรือไม่
  const reminder = await prisma.reminder.findUnique({
    where: { id },
  });

  if (!reminder || reminder.userId !== user.id) {
    return NextResponse.json(
      { error: "ไม่พบรายการหรือคุณไม่มีสิทธิ์ลบรายการนี้" },
      { status: 404 }
    );
  }

  await prisma.reminder.delete({
    where: { id },
  });

  return NextResponse.json({ message: "ลบรายการสำเร็จ" });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();

  const reminder = await prisma.reminder.findUnique({
    where: { id },
  });

  if (!reminder || reminder.userId !== user.id) {
    return NextResponse.json({ error: "ไม่พบรายการ" }, { status: 404 });
  }

  const updated = await prisma.reminder.update({
    where: { id },
    data: {
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : reminder.isActive,
    },
  });

  return NextResponse.json({ message: "อัปเดตสถานะสำเร็จ", reminder: updated });
}
