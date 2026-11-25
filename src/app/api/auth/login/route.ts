import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPin, createSessionToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, pin } = await req.json();

    if (!username || !pin) {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อและรหัส PIN 4 หลัก" },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();

    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const isValidPin = await verifyPin(String(pin), user.pinHash);
    if (!isValidPin) {
      return NextResponse.json(
        { error: "ชื่อผู้ใช้หรือรหัส PIN ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    // สร้าง Token
    const token = await createSessionToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        lineUserId: user.lineUserId,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" },
      { status: 500 }
    );
  }
}
