import prisma from '../lib/prisma.js';
import { badRequest, conflict, unauthorized } from '../utils/httpError.js';
import {
  hashPassword,
  checkPassword,
  createToken,
  toPublicUser,
} from '../services/auth.service.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
// body: { name, email, password }
export async function register(req, res) {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (name.length < 2) throw badRequest('Името трябва да е поне 2 символа');
  if (!EMAIL_REGEX.test(email)) throw badRequest('Невалиден имейл');
  if (password.length < 8) throw badRequest('Паролата трябва да е поне 8 символа');

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict('Този имейл вече е регистриран');

  let user;
  try {
    user = await prisma.user.create({
      data: { name, email, passwordHash: await hashPassword(password) },
    });
  } catch (err) {
    // Двама се регистрират едновременно със същия имейл
    if (err.code === 'P2002') throw conflict('Този имейл вече е регистриран');
    throw err;
  }

  res.status(201).json({ token: createToken(user), user: toPublicUser(user) });
}

// POST /api/auth/login
// body: { email, password }
export async function login(req, res) {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  if (!email || !password) throw badRequest('Въведете имейл и парола');

  const user = await prisma.user.findUnique({ where: { email } });

  // Едно и също съобщение при грешен имейл и при грешна парола,
  // за да не се издава кои имейли са регистрирани
  if (!user || !(await checkPassword(password, user.passwordHash))) {
    throw unauthorized('Грешен имейл или парола');
  }

  res.json({ token: createToken(user), user: toPublicUser(user) });
}
