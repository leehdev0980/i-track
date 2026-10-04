import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = process.env.JWT_SECRET;

if(!secret) {
  throw new Error("JWT_SECRET is not defined");
}

const secretKey = new TextEncoder().encode(secret);

export type AuthUser = {
  id: number;
  email: string;
  role: "ADMIN" | "STANDARD";
};

export async function createToken(user: AuthUser) {
  return new SignJWT(user)
  .setProtectedHeader({ alg: "HS256"})
  .setIssuedAt()
  .setExpirationTime("7d")
  .sign(secretKey);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey);

  return {
    id: Number(payload.id),
    email: String(payload.email),
    role: payload.role as "ADMIN" | "STANDARD",
  };
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if(!token) {
    return null;
  }

  try {
    return await verifyToken(token);
  } catch {
    return null;
  }
}