import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ดึงรายการเตือนความจำเฉพาะของ User คนนั้น (Data Isolation)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  const reminders = await prisma.reminder.findMany({
    where: { userId: user.id },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json({ reminders });
}

// สร้างรายการเตือนความจำใหม่
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อน" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      category = "CREDIT_CARD",
      amount,
      cycleStartDate,
      cycleEndDate,
      dueDate,
      notifyDaysBefore = 3,
      isRecurring = true,
    } = body;

    if (!title || !dueDate) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อรายการและวันครบกำหนดชำระ" },
        { status: 400 }
      );
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        title: title.trim(),
        category,
        amount: amount ? parseFloat(amount) : null,
        cycleStartDate: cycleStartDate ? parseInt(cycleStartDate, 10) : null,
        cycleEndDate: cycleEndDate ? parseInt(cycleEndDate, 10) : null,
        dueDate: new Date(dueDate),
        notifyDaysBefore: parseInt(notifyDaysBefore, 10) || 3,
        isRecurring: Boolean(isRecurring),
      },
    });

    return NextResponse.json({ message: "เพิ่มรายการสำเร็จ", reminder }, { status: 201 });
  } catch (error) {
    console.error("Create Reminder Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" },
      { status: 500 }
    );
  }
}
