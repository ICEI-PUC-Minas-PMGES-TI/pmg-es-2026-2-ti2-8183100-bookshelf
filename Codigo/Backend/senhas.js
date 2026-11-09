import { randomBytes, scrypt as derivarChave, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(derivarChave);

export async function protegerSenha(senha) {
  const sal = randomBytes(16).toString("hex");
  const chave = await scrypt(senha, sal, 64);
  return `scrypt:${sal}:${chave.toString("hex")}`;
}

// Contas anteriores continuam podendo entrar e trocar a senha.
export async function conferirSenha(informada, salva) {
  if (typeof informada !== "string" || typeof salva !== "string") return false;
  if (!salva.startsWith("scrypt:")) return informada === salva;
  const [, sal, hash] = salva.split(":");
  if (!sal || !/^[a-f0-9]{128}$/.test(hash ?? "")) return false;
  const chave = await scrypt(informada, sal, 64);
  return timingSafeEqual(chave, Buffer.from(hash, "hex"));
}
