import { PrismaClient, Prisma } from "../app/generated/prisma/client";

import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});


async function main() {
  await prisma.product.upsert({
    where: { name: "Milk Powder" },
    update: {},
    create: {
      name: "Milk Powder",
      description: "Full cream milk powder 1kg",
      quantity: 5,
      minThreshold: 10,
      price: 12.50,
      category: "Dairy",
    },
  });
  console.log("Database seeded!");
}

main().catch((e) => console.error(e)).finally(async () => await prisma.$disconnect());