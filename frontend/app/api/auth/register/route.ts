import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  // Validação de e-mail
  const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailRegex.test(email)) {
    return NextResponse.json({ success: false, message: "E-mail inválido." }, { status: 400 });
  }

  // Validação de senha
  if (!password || password.length < 6) {
    return NextResponse.json({ success: false, message: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  // Caminho do arquivo de usuários
  const usersPath = path.join(process.cwd(), "app/api/auth/users.json");
  let users: any[] = [];
  try {
    const data = await fs.readFile(usersPath, "utf-8");
    users = JSON.parse(data);
  } catch (err) {
    // Se erro for diferente de arquivo inexistente, retorna erro 500
    if (err && (err as any).code !== 'ENOENT') {
      return NextResponse.json({ success: false, message: "Erro interno ao acessar usuários", details: String(err) }, { status: 500 });
    }
    users = [];
  }

  // Verifica se usuário já existe
  if (users.some(u => u.email === email)) {
    return NextResponse.json({ success: false, message: "Usuário já cadastrado." }, { status: 409 });
  }

  // Cria novo usuário
  const newUser = {
    id: crypto.randomUUID(),
    email,
    password, // Em produção, nunca salve senha em texto puro!
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  try {
    await fs.writeFile(usersPath, JSON.stringify(users, null, 2));
  } catch (err) {
    return NextResponse.json({ success: false, message: "Error saving user", details: String(err) }, { status: 500 });
  }

  // Gera token simulado
  const token = crypto.randomBytes(16).toString("hex");

  return NextResponse.json({ success: true, message: "Usuário registrado com sucesso!", user: { id: newUser.id, email: newUser.email }, token });
}
