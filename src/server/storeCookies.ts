'use server'
import { cookies } from "next/headers"

export async function removeTokenCookie() {
  const cookieStore = await cookies();
  cookieStore.set("token", "", {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}