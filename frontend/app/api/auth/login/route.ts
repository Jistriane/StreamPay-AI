import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import fs from "fs/promises";

const usersPath = path.join(process.cwd(), "app/api/auth/users.json");

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ success: false, message: "Email e senha obrigatórios." }, { status: 400 });
  }
  let users: any[] = [];
  try {
    const data = await fs.readFile(usersPath, "utf-8");
    users = JSON.parse(data);
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error accessing users.", details: String(err) }, { status: 500 });
  }
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return NextResponse.json({ success: false, message: "Email ou senha inválidos." }, { status: 401 });
  }
  // Simula token
  const token = randomUUID().replace(/-/g, "").slice(0, 32);
  return NextResponse.json({ success: true, message: "Login realizado com sucesso!", user: { id: user.id, email: user.email }, token });
}