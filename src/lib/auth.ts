import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only-min-32-chars-long";
const key = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE_NAME = "reminder_session_token";

export interface UserPayload {
  userId: string;
  username: string;
  role: string;
}

// แฮช PIN 4 หลักด้วย bcrypt
export async function hashPin(pin: string): Promise<string> {
  if (!/^\d{4}$/.test(pin)) {
    throw new Error("PIN ต้องเป็นตัวเลข 4 หลักเท่านั้น");
  }
  return await bcrypt.hash(pin, 10);
}

// ตรวจสอบความถูกต้องของ PIN
export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(pin, hash);
}

// สร้าง JWT Token อายุ 30 วัน
export async function createSessionToken(payload: UserPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(key);
}

// ถอดรหัสและตรวจสอบ JWT Token
export async function verifySessionToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

// ดึงข้อมูล User ปัจจุบันจาก Cookie
export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = await verifySessionToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      role: true,
      lineUserId: true,
      createdAt: true,
    },
  });

  return user;
}
