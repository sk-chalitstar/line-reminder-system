import { NextResponse } from "next/server";
import { validateLineSignature, lineClient } from "@/lib/line";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-line-signature");

    // ตรวจสอบ Signature จาก LINE Platform ป้องกันการส่งข้อมูลปลอม
    if (!validateLineSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    const events = data.events || [];

    for (const event of events) {
      // ตรวจจับเหตุการณ์ที่เป็นข้อความตัวอักษร
      if (event.type === "message" && event.message.type === "text") {
        const text = event.message.text.trim();
        const lineUserId = event.source.userId;
        const replyToken = event.replyToken;

        if (!lineUserId || !replyToken) continue;

        // คำสั่งช่วยเหลือ
        if (text.toLowerCase() === "help" || text === "วิธีใช้" || text === "ช่วยเหลือ") {
          await lineClient.replyMessage({
            replyToken,
            messages: [
              {
                type: "text",
                text: "📖 วิธีการเชื่อมต่อระบบ:\n1. สมัครสมาชิกบนเว็บไซต์\n2. พิมพ์ 'ชื่อผู้ใช้ของคุณ' ส่งมาในแชทนี้\n3. ระบบจะทำการผูก LINE ID และเริ่มส่งการแจ้งเตือนให้อัตโนมัติครับ",
              },
            ],
          });
          continue;
        }

        // ค้นหา User จากชื่อที่พิมพ์เข้ามา
        const targetUser = await prisma.user.findUnique({
          where: { username: text },
        });

        if (!targetUser) {
          await lineClient.replyMessage({
            replyToken,
            messages: [
              {
                type: "text",
                text: `❌ ไม่พบผู้ใช้งาน "${text}" ในระบบ\n\nโปรดตรวจสอบชื่อที่ลงทะเบียนบนเว็บไซต์ หรือพิมพ์ชื่อให้ถูกต้องอีกครั้งครับ (พิมพ์ "วิธีใช้" เพื่อดูคู่มือ)`,
              },
            ],
          });
          continue;
        }

        // กรณีชื่อนี้ถูกผูกกับ LINE ID อื่นอยู่แล้ว
        if (targetUser.lineUserId && targetUser.lineUserId !== lineUserId) {
          await lineClient.replyMessage({
            replyToken,
            messages: [
              {
                type: "text",
                text: `⚠️ ชื่อบัญชี "${text}" ถูกเชื่อมต่อกับบัญชี LINE อื่นแล้ว\nหากต้องการเปลี่ยน กรุณาให้ผู้ดูแลระบบยกเลิกการผูกก่อนครับ`,
              },
            ],
          });
          continue;
        }

        // อัปเดตบันทึก LINE User ID ให้กับผู้ใช้คนนี้
        await prisma.user.update({
          where: { id: targetUser.id },
          data: { lineUserId },
        });

        // ส่งข้อความยืนยันความสำเร็จ
        await lineClient.replyMessage({
          replyToken,
          messages: [
            {
              type: "text",
              text: `🎉 ยินดีด้วยครับคุณ ${targetUser.username}!\n\nระบบได้เชื่อมต่อ LINE ของคุณเข้ากับระบบเตือนความจำเรียบร้อยแล้ว\nเมื่อถึงกำหนดชำระบัตรเครดิตหรือบิลต่างๆ ระบบจะส่งแจ้งเตือนมาที่นี่ทันทีครับ 🔔`,
            },
          ],
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LINE Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
