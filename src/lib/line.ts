import { messagingApi } from "@line/bot-sdk";
import crypto from "crypto";

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || "";
const channelSecret = process.env.LINE_CHANNEL_SECRET || "";

export const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken,
});

// ตรวจสอบความถูกต้องของ LINE Webhook Signature
export function validateLineSignature(body: string, signature: string | null): boolean {
  if (!signature || !channelSecret) return false;
  const hash = crypto
    .createHmac("sha256", channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// สร้าง LINE Flex Message สวยงามสำหรับการแจ้งเตือน
export function createReminderFlexMessage(item: {
  title: string;
  category: string;
  amount?: number | null;
  cycleStartDate?: number | null;
  cycleEndDate?: number | null;
  dueDate: Date;
  diffDays: number;
}) {
  const isToday = item.diffDays === 0;
  const headerColor = isToday ? "#DC2626" : "#2563EB";
  const statusBadge = isToday ? "🚨 ครบกำหนดชำระวันนี้!" : `⚠️ อีก ${item.diffDays} วันจะครบกำหนดชำระ`;

  const dueDateFormatted = new Date(item.dueDate).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const categoryName =
    item.category === "CREDIT_CARD"
      ? "💳 บัตรเครดิต"
      : item.category === "BILL"
      ? "📄 ค่าน้ำ/ไฟ/บิล"
      : "📌 เตือนความจำทั่วไป";

  const rows: any[] = [
    {
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "ประเภท", size: "sm", color: "#666666", flex: 2 },
        { type: "text", text: categoryName, size: "sm", color: "#111111", align: "end", flex: 3 },
      ],
    },
  ];

  if (item.amount) {
    rows.push({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "ยอดที่ต้องชำระ", size: "sm", color: "#666666", flex: 2 },
        {
          type: "text",
          text: `฿${item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
          size: "sm",
          color: "#E11D48",
          weight: "bold",
          align: "end",
          flex: 3,
        },
      ],
    });
  }

  if (item.cycleStartDate && item.cycleEndDate) {
    rows.push({
      type: "box",
      layout: "horizontal",
      contents: [
        { type: "text", text: "รอบบิล", size: "sm", color: "#666666", flex: 2 },
        {
          type: "text",
          text: `วันที่ ${item.cycleStartDate} ถึง ${item.cycleEndDate}`,
          size: "sm",
          color: "#333333",
          align: "end",
          flex: 3,
        },
      ],
    });
  }

  rows.push({
    type: "box",
    layout: "horizontal",
    contents: [
      { type: "text", text: "วันครบกำหนด", size: "sm", color: "#666666", flex: 2 },
      { type: "text", text: dueDateFormatted, size: "sm", color: "#111111", weight: "bold", align: "end", flex: 3 },
    ],
  });

  return {
    type: "flex",
    altText: `${statusBadge}: ${item.title}`,
    contents: {
      type: "bubble",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: headerColor,
        contents: [
          {
            type: "text",
            text: statusBadge,
            color: "#FFFFFF",
            weight: "bold",
            size: "md",
          },
          {
            type: "text",
            text: item.title,
            color: "#FFFFFF",
            weight: "bold",
            size: "xl",
            margin: "md",
          },
        ],
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: rows,
      },
      footer: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ระบบแจ้งเตือนอัตโนมัติ Reminder App",
            size: "xs",
            color: "#999999",
            align: "center",
          },
        ],
      },
    },
  };
}
