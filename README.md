# 🔔 ระบบเตือนความจำและแจ้งเตือนผ่านไลน์ (Smart LINE Reminder System)

ระบบ Web Application สำหรับบันทึกรอบบิลบัตรเครดิต ค่าไฟ ค่าน้ำ และรายการเตือนความจำส่วนตัว พร้อมส่งข้อความแจ้งเตือนเข้าสู่แอปพลิเคชัน LINE อัตโนมัติเมื่อใกล้ถึงกำหนดชำระเงิน

---

## ✨ คุณสมบัติเด่นของระบบ (Features)

1. **ระบบลงทะเบียนและเข้าสู่ระบบด้วย PIN 4 หลัก**
   - สมัครสมาชิกรวดเร็วโดยใช้ **ชื่อผู้ใช้งาน (Username)** และ **รหัสผ่าน PIN 4 หลัก**
   - เข้ารหัสความปลอดภัยด้วย `bcryptjs`
   - เมื่อสมัครเสร็จ ระบบจะพาเข้าสู่ Dashboard ได้ทันที
2. **Dashboard ข้อมูลส่วนตัว (User Data Isolation)**
   - สมาชิกแต่ละคนจะเห็นเฉพาะรายการเตือนความจำของตนเองเท่านั้น
   - มีป้ายแจ้งสถานะการเชื่อมต่อ LINE อย่างชัดเจน
3. **จัดการรอบบิลบัตรเครดิตและค่าใช้จ่าย**
   - บันทึกชื่อบัตร / บิล, ยอดเงิน
   - กำหนด **วันเริ่มรอบบิล** ถึง **วันตัดรอบบิล**
   - กำหนด **วันครบกำหนดชำระจริง**
   - เลือกระยะเวลา **แจ้งเตือนล่วงหน้าได้ตามต้องการ** (เช่น 1, 2, 3, 5, 7 วัน หรือในวันครบกำหนด)
   - มีระบบ Recurring ต่อยอดรอบบิลใหม่อัตโนมัติทุกเดือน
4. **เชื่อมต่อ LINE ง่ายดายใน 1 ขั้นตอน**
   - เพียงเพิ่มเพื่อน LINE Official Account แล้วพิมพ์ **ชื่อผู้ใช้ของตนเอง** ลงในแชท
   - ระบบจะตรวจจับและบันทึก LINE User ID ให้อัตโนมัติทันที
5. **แจ้งเตือนด้วย LINE Flex Message**
   - มีการจัดรูปแบบการ์ดแจ้งเตือนอย่างสวยงาม แสดงยอดเงิน วันครบกำหนด และระดับความเร่งด่วน
6. **แผงผู้ดูแลระบบ (Admin Console)**
   - ตรวจสอบรายชื่อผู้ใช้งานทั้งหมด พร้อมจำนวนรายการเตือน
   - ลบ User และล้างข้อมูลของคนนั้นทั้งหมดแบบ Cascade Delete
   - สั่งล้างข้อมูลบิลเก่าที่หมดอายุเกิน 30 วันเพื่อประหยัดพื้นที่จัดเก็บ

---

## 🛠️ โครงสร้างเทคโนโลยี (Tech Stack)

- **Frontend & Backend**: Next.js 14+ (App Router, TypeScript)
- **Styling**: Tailwind CSS, Lucide React Icons
- **Database**: PostgreSQL / SQLite ผ่าน Prisma ORM
- **Authentication**: JWT (JSON Web Tokens via `jose`) + HTTP-only Cookie
- **LINE Integration**: `@line/bot-sdk` (Messaging API & Webhook Signature Validation)
- **Scheduler (Cron)**: `node-cron` สำหรับ Server/VPS หรือ Webhook Trigger สำหรับ Serverless

---

## 🚀 ขั้นตอนการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### 1. โคลน Repository และติดตั้ง Dependencies

```bash
cd line-reminder-system
npm install
```

---

### 2. เตรียม LINE Official Account และ Messaging API

1. เข้าไปที่ [LINE Developers Console](https://developers.line.biz/) และเข้าสู่ระบบด้วยบัญชี LINE
2. กด **Create a new Provider** (เช่น `MyReminderApp`)
3. กด **Create a Messaging API channel**
   - กรอกข้อมูลชื่อ Bot, หมวดหมู่ และอีเมล
4. เข้าไปที่แท็บ **Messaging API**:
   - ค้นหาหัวข้อ **Channel access token** กดปุ่ม **Issue** แล้วคัดลอก Token มา
5. เข้าไปที่แท็บ **Basic settings**:
   - คัดลอกค่า **Channel secret**
6. ปิดระบบ Auto-reply ของ LINE เพื่อไม่ให้ตอบแทรกแซงบอท:
   - ที่แท็บ Messaging API เลื่อนลงมาที่ **LINE Official Account features**
   - กด Edit ที่ **Auto-reply messages** -> ให้ปิด (Disabled) ทั้ง Greeting message และ Auto-response

---

### 3. ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)

สร้างไฟล์ `.env` จาก `.env.example`:

```bash
cp .env.example .env
```

เปิดไฟล์ `.env` และกรอกค่าต่างๆ:

```env
# Database (ค่าเริ่มต้นเป็น SQLite สำหรับทดสอบบนเครื่อง)
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="สุ่มสตริงความยาว32ตัวอักษรขึ้นไป"

# LINE API
LINE_CHANNEL_SECRET="ใส่ Channel Secret ของคุณ"
LINE_CHANNEL_ACCESS_TOKEN="ใส่ Channel Access Token ของคุณ"
LINE_BOT_BASIC_ID="@ไอดีบอทของคุณ"

# รหัสผ่านสำหรับสมัครแอดมิน (ใส่ในช่อง Admin Secret ตอนสมัครสมาชิก)
ADMIN_SECRET_KEY="รหัสลับแอดมินตามต้องการ"

# Cron Secret สำหรับสั่งยิงแจ้งเตือน
CRON_SECRET="รหัสลับสำหรับcron"
```

---

### 4. ซิงก์ฐานข้อมูล (Prisma Migration)

```bash
npx prisma db push
```

---

### 5. สตาร์ตโปรเจกต์ทดสอบบนเครื่อง Local

```bash
npm run dev
```

เปิดบราวเซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

---

### 6. ทดสอบรับ LINE Webhook ด้วย `ngrok`

เนื่องจาก LINE Webhook ต้องใช้ URL ที่เป็น HTTPS ให้เปิดหน้าต่าง Terminal ใหม่แล้วรัน:

```bash
npx ngrok http 3000
```

1. นำ Forwarding URL ที่ได้ เช่น `https://xxxx-xx.ngrok-free.app`
2. เติม Path `/api/line/webhook` เช่น:
   ```text
   https://xxxx-xx.ngrok-free.app/api/line/webhook
   ```
3. นำไปวางใน LINE Developers Console ในช่อง **Webhook URL**
4. กดปุ่ม **Verify** (ต้องขึ้นข้อความ Success)
5. เปิดสวิตช์ **Use Webhook** ให้เป็นสีเขียว

---

## ⏰ การทำงานของระบบส่งแจ้งเตือนอัตโนมัติ (Cron Worker)

ระบบรองรับการยิงแจ้งเตือน 2 รูปแบบ:

1. **โหมด Background Worker (เหมาะกับ VPS / Docker / Railway)**:
   ```bash
   npm run worker
   ```
   Worker จะรันอยู่เบื้องหลังและตรวจสอบเพื่อส่ง LINE อัตโนมัติทุกวันเวลา 08:30 น.

2. **โหมด Serverless / Cloud Cron (เหมาะกับ Vercel / GitHub Actions / Cron-job.org)**:
   - ยิง HTTP GET ไปที่:
     ```text
     https://your-domain.com/api/cron/trigger?secret=your_cron_secret
     ```
   - ในไฟล์ `vercel.json` ได้ตั้งค่า Vercel Cron ให้เรียกอัตโนมัติไว้เรียบร้อยแล้ว

---

## 📦 ขั้นตอนการนำขึ้น GitHub

```bash
# 1. ตรวจสอบสถานะไฟล์ (แน่ใจว่า .env ไม่ติดขึ้นไป)
git status

# 2. เริ่มต้น Git และ Commit
git init
git add .
git commit -m "feat: Initial commit for Smart LINE Reminder System"

# 3. เชื่อมต่อกับ GitHub Repository ของคุณ
git branch -M main
git remote add origin https://github.com/your-username/your-repo-name.git

# 4. Push ข้อมูลขึ้น GitHub
git push -u origin main
```

---

## 🌐 การนำขึ้น Cloud Hosting (Deploy to Production)

### แนะนำ: Deploy บน Railway หรือ Render (ฟรี / ประหยัด)
1. ผูกบัญชีกับ GitHub แล้วเลือก Repository นี้
2. สร้าง PostgreSQL Database บน **Supabase** หรือ **Neon.tech** (ฟรี)
3. เปลี่ยน `provider = "postgresql"` ในไฟล์ `prisma/schema.prisma`
4. ตั้งค่า **Environment Variables** บน Dashboard ของโฮสติ้ง
5. นำ URL จริง เช่น `https://your-app.railway.app/api/line/webhook` ไปใส่ใน LINE Developers Console

---

## 🛡️ สิทธิ์ Admin เข้าถึงอย่างไร?

1. เข้าหน้าลงทะเบียน `/register`
2. กรอกชื่อและ PIN 4 หลัก
3. กดที่ข้อความ **"ต้องการสมัครเป็น Admin หรือไม่?"**
4. ใส่รหัสที่ตรงกับ `ADMIN_SECRET_KEY` ในไฟล์ `.env`
5. เมื่อเข้าสู่ระบบ จะมีปุ่ม **"แผงผู้ดูแลระบบ"** ขึ้นมาให้ใช้งาน สามารถตรวจสอบและลบ User หรือล้างข้อมูลเก่าได้ทันที

---

© 2026 Smart LINE Reminder System.
