import cron from "node-cron";
import { prisma } from "./lib/prisma";
import { lineClient, createReminderFlexMessage } from "./lib/line";

console.log("🚀 LINE Reminder Worker started...");
console.log("⏰ สั่งรันตรวจเช็กการแจ้งเตือนทุกวันเวลา 08:30 น. (Asia/Bangkok)");

// ฟังก์ชันตรวจสอบและยิงแจ้งเตือน
async function checkAndSendReminders() {
  console.log("🔍 [Cron Worker] เริ่มตรวจสอบรายการเตือนความจำประจำวัน...");
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    for (const item of activeReminders) {
      if (!item.user.lineUserId) continue;

      const dueDate = new Date(item.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      const shouldNotify = diffDays === item.notifyDaysBefore || diffDays === 0;

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

          await prisma.reminder.update({
            where: { id: item.id },
            data: { lastNotifiedAt: new Date() },
          });

          console.log(`✅ [Sent] ส่งเตือน "${item.title}" ถึงคุณ ${item.user.username}`);

          if (diffDays === 0 && item.isRecurring) {
            const nextMonthDate = new Date(item.dueDate);
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
            await prisma.reminder.update({
              where: { id: item.id },
              data: { dueDate: nextMonthDate },
            });
            console.log(`🔄 [Rollover] ปรับรอบบิลใหม่เป็น ${nextMonthDate.toLocaleDateString("th-TH")}`);
          }
        } catch (err) {
          console.error(`❌ [Error] ส่งถึง ${item.user.username} ล้มเหลว:`, err);
        }
      }
    }
  } catch (error) {
    console.error("❌ Worker execution error:", error);
  }
}

// ตั้งเวลาให้รันทุกวันตอน 08:30 น. ตามเวลาไทย
cron.schedule(
  "30 8 * * *",
  () => {
    checkAndSendReminders();
  },
  {
    timezone: "Asia/Bangkok",
  }
);

// ทดสอบรันครั้งแรกทันทีเมื่อเริ่ม Worker
checkAndSendReminders();
