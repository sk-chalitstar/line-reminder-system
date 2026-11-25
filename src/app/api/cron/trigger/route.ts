import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { lineClient, createReminderFlexMessage } from "@/lib/line";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");

  // ป้องกันการเรียกใช้โดยไม่ได้รับอนุญาต
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized cron trigger" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ค้นหารายการแจ้งเตือนที่เปิดใช้งานอยู่ และผู้ใช้ผูก LINE เรียบร้อยแล้ว
    const activeReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        user: {
          lineUserId: { not: null },
        },
      },
      include: {
        user: true,
      },
    });

    let sentCount = 0;
    const logs: string[] = [];

    for (const item of activeReminders) {
      if (!item.user.lineUserId) continue;

      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      // ตรวจสอบว่าตรงกับเงื่อนไขแจ้งเตือนล่วงหน้า หรือครบกำหนดวันนี้
      const shouldNotify = diffDays === item.notifyDaysBefore || diffDays === 0;

      // ตรวจสอบว่าวันนี้ส่งไปแล้วหรือยัง (กันส่งซ้ำในวันเดียวกัน)
      const alreadySentToday =
        item.lastNotifiedAt &&
        new Date(item.lastNotifiedAt).toDateString() === today.toDateString();

      if (shouldNotify && !alreadySentToday) {
        try {
          const flexMessage = createReminderFlexMessage({
            title: item.title,
            category: item.category,
            amount: item.amount,
            cycleStartDate: item.cycleStartDate,
            cycleEndDate: item.cycleEndDate,
            dueDate: item.dueDate,
            diffDays,
          });

          await lineClient.pushMessage({
            to: item.user.lineUserId,
            messages: [flexMessage as any],
          });

          // อัปเดตเวลาที่ส่งแจ้งเตือนล่าสุด
          await prisma.reminder.update({
            where: { id: item.id },
            data: { lastNotifiedAt: new Date() },
          });

          sentCount++;
          logs.push(`ส่งแจ้งเตือน "${item.title}" ให้ ${item.user.username} (diffDays: ${diffDays})`);

          // หากเป็นวันครบกำหนด (diffDays === 0) และเป็นบิลประจำ (isRecurring = true)
          // ให้ขยับรอบบิลถัดไปอัตโนมัติในเดือนหน้า
          if (diffDays === 0 && item.isRecurring) {
            const nextMonthDate = new Date(item.dueDate);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            await prisma.reminder.update({
              where: { id: item.id },
              data: { dueDate: nextMonthDate },
            });
            logs.push(`เลื่อนรอบบิล "${item.title}" ไปเดือนถัดไป: ${nextMonthDate.toISOString()}`);
          }
        } catch (pushError) {
          console.error(`เกิดข้อผิดพลาดในการส่ง LINE ถึง ${item.user.username}:`, pushError);
          logs.push(`ล้มเหลวในการส่งให้ ${item.user.username}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      sentCount,
      logs,
    });
  } catch (error) {
    console.error("Cron Job Error:", error);
    return NextResponse.json({ error: "Cron execution failed" }, { status: 500 });
  }
}
