import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPin, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, pin, adminKey } = await req.json();

    if (!username || typeof username !== "string" || username.trim().length < 2) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อผู้ใช้งานอย่างน้อย 2 ตัวอักษร" },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim();

    if (!pin || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: "รหัสผ่าน PIN ต้องเป็นตัวเลข 4 หลักเท่านั้น" },
        { status: 400 }
      );
    }

    // ตรวจสอบชื่อซ้ำ
    const existing = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { error: "ชื่อนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น" },
        { status: 409 }
      );
    }

    // ตรวจสอบ Role (หากใส่ Admin Secret ถูกต้องจะได้สิทธิ์ ADMIN)
    const isAdmin =
      Boolean(adminKey) &&
      Boolean(process.env.ADMIN_SECRET_KEY) &&
      adminKey === process.env.ADMIN_SECRET_KEY;

    const pinHash = await hashPin(pin);

    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        pinHash,
        role: isAdmin ? "ADMIN" : "USER",
      },
      select: {
        id: true,
        username: true,
        role: true,
        lineUserId: true,
      },
    });

    // สร้าง Token และบันทึกลง HTTP-only Cookie เข้าสู่ระบบได้เลย
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "ลงทะเบียนสำเร็จและเข้าสู่ระบบเรียบร้อย",
      user,
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 วัน
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง" },
      { status: 500 }
    );
  }
}
