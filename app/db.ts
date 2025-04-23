import { prisma } from './lib/prisma';
import { genSaltSync, hashSync } from 'bcrypt-ts';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle

export async function getUser(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  return await prisma.user.create({
    data: {
      email,
      password: hash,
    },
  });
}