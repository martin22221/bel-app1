import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';

export async function authenticate(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Неоторизиран достъп' });
    }

    const token = authorization.slice('Bearer '.length);
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return res.status(401).json({ message: 'Потребителят не е намерен' });
    }

    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Невалиден токен' });
  }
}
