import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export async function registerUser(name, email, password, role) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('A user with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  let customerId = null;

  if (role === 'customer') {
    let customer = await prisma.customer.findUnique({ where: { email } });
    if (!customer) {
      customer = await prisma.customer.create({
        data: { name, email }
      });
    }
    customerId = customer.id;
  }

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, customerId }
  });

  return { id: user.id, name: user.name, email: user.email, role: user.role, customerId: user.customerId };
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(password, user.password);
  if (!passwordMatches) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign(
    { userId: user.id, role: user.role, email: user.email, customerId: user.customerId },
    JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role, customerId: user.customerId } };
}