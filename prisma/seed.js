import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      company: 'Acme Corp',
      tickets: {
        create: [
          { subject: 'Battery not charging', description: 'Laptop battery stopped working after 10 months.' }
        ]
      }
    }
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Verma',
      email: 'priya@example.com',
      company: 'Beta Industries',
      tickets: {
        create: [
          { subject: 'Refund request', description: 'Product arrived damaged, want a refund.' }
        ]
      }
    }
  });

  console.log('Seeded:', { customer1, customer2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });