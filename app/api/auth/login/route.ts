// app/api/auth/login/route.ts
import { prisma } from "@/app/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Plain text password check (TODO: replace with bcrypt.compare in production!)
    if (user.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Set session cookie
    cookies().set("session_user", JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Return success + redirect URL
    let redirectUrl = "/employee";
    if (user.role === "super_admin") {
      redirectUrl = "/super-admin";
    } else if (user.role === "company_admin") {
      redirectUrl = "/company-admin";
    }

    return NextResponse.json({ success: true, redirectTo: redirectUrl });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}