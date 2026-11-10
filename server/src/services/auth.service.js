import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const TOKEN_EXPIRES_IN = '7d';

export function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function checkPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// Създава JWT токен с id и роля на потребителя
export function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error('Липсва JWT_SECRET в .env');
  }
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });
}

// Данните за потребителя, които е безопасно да се върнат (без passwordHash)
export function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
